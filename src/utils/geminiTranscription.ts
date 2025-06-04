
import { GoogleGenerativeAI } from '@google/generative-ai';
import { TranscriptionLine, WordTimestamp } from '../types/transcription';
import { apiRateLimit } from './apiRateLimit';

interface TranscriptionOptions {
  file: File;
  language: string;
}

// Convert file to base64
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        const base64 = reader.result.split(',')[1];
        resolve(base64);
      } else {
        reject(new Error('Failed to convert file to base64'));
      }
    };
    reader.onerror = error => reject(error);
  });
};

// Parse timestamp to seconds
const parseTimestamp = (timestamp: string): number => {
  const parts = timestamp.split(':');
  if (parts.length === 2) {
    const [minutes, seconds] = parts.map(parseFloat);
    return minutes * 60 + seconds;
  } else if (parts.length === 3) {
    const [hours, minutes, seconds] = parts.map(parseFloat);
    return hours * 3600 + minutes * 60 + seconds;
  }
  return 0;
};

// Generate word-level timestamps (approximation)
const generateWordTimestamps = (text: string, startTime: number, endTime: number): WordTimestamp[] => {
  const words = text.split(' ').filter(word => word.trim());
  const duration = endTime - startTime;
  const wordsPerSecond = words.length / duration;
  
  return words.map((word, index) => {
    const wordDuration = 1 / wordsPerSecond;
    const wordStartTime = startTime + (index * wordDuration);
    const wordEndTime = wordStartTime + wordDuration;
    
    return {
      word: word.trim(),
      startTime: wordStartTime,
      endTime: Math.min(wordEndTime, endTime),
      confidence: 95 // Approximate confidence
    };
  });
};

export const transcribeWithGemini = async ({ file, language }: TranscriptionOptions): Promise<TranscriptionLine[]> => {
  try {
    const apiKey = apiRateLimit.getAvailableApiKey();
    
    if (!apiKey) {
      throw new Error('API rate limit exceeded. Please try again in a minute.');
    }

    console.log('Converting file to base64...');
    const base64Data = await fileToBase64(file);
    
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
    
    const prompt = `Transcribe this ${file.type.startsWith('audio/') ? 'audio' : 'video'} file and provide detailed results in the following JSON format:

{
  "transcription": [
    {
      "timestamp": "MM:SS or HH:MM:SS format",
      "startTime": number_in_seconds,
      "endTime": number_in_seconds,
      "text": "transcribed text",
      "speaker": "Speaker 1, Speaker 2, etc. (if multiple speakers detected)",
      "confidence": number_0_to_100
    }
  ]
}

Important instructions:
1. If the detected language is "${language === 'en' ? 'English' : 'non-English'}" and the target language is "${language}", return the original transcription without translation
2. If translation is needed, translate to ${language === 'en' ? 'English' : `language code: ${language}`} while preserving all timing information
3. Break into natural sentence segments with accurate timestamps
4. Include speaker identification if multiple speakers are detected
5. Provide confidence scores for each segment
6. Ensure timestamps are precise and non-overlapping
7. Return ONLY the JSON response, no additional text`;

    console.log('Sending request to Gemini...');
    const result = await model.generateContent([
      {
        inlineData: {
          mimeType: file.type,
          data: base64Data
        }
      },
      { text: prompt }
    ]);

    apiRateLimit.incrementUsage();
    
    const response = await result.response;
    const text = response.text();
    
    console.log('Raw Gemini response:', text);
    
    // Extract JSON from the response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Invalid response format from Gemini');
    }
    
    const parsedResponse = JSON.parse(jsonMatch[0]);
    
    if (!parsedResponse.transcription || !Array.isArray(parsedResponse.transcription)) {
      throw new Error('Invalid transcription format in response');
    }
    
    // Process the transcription data
    const transcriptionLines: TranscriptionLine[] = parsedResponse.transcription.map((item: any, index: number) => {
      const startTime = typeof item.startTime === 'number' ? item.startTime : parseTimestamp(item.timestamp);
      const endTime = typeof item.endTime === 'number' ? item.endTime : startTime + 5; // Default 5 second duration
      
      // Generate word-level timestamps
      const words = generateWordTimestamps(item.text, startTime, endTime);
      
      return {
        text: item.text || '',
        timestamp: item.timestamp || `${Math.floor(startTime / 60)}:${String(Math.floor(startTime % 60)).padStart(2, '0')}`,
        startTime,
        endTime,
        speaker: item.speaker || (index === 0 ? 'Speaker 1' : undefined),
        confidence: typeof item.confidence === 'number' ? item.confidence : 95,
        words
      };
    });
    
    console.log('Processed transcription lines:', transcriptionLines);
    return transcriptionLines;
    
  } catch (error) {
    console.error('Transcription error:', error);
    throw new Error(error instanceof Error ? error.message : 'Transcription failed');
  }
};
