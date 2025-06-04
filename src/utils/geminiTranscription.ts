
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
      confidence: 95
    };
  });
};

// Clean and extract JSON from response
const extractAndCleanJSON = (text: string): any => {
  // Remove markdown code blocks
  let cleanedText = text.replace(/```json\s*/g, '').replace(/```\s*/g, '');
  
  // Find JSON object
  const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('No JSON found in response');
  }
  
  let jsonStr = jsonMatch[0];
  
  // Fix common JSON issues
  jsonStr = jsonStr
    .replace(/,\s*}/g, '}') // Remove trailing commas
    .replace(/,\s*]/g, ']') // Remove trailing commas in arrays
    .replace(/\n/g, ' ') // Replace newlines with spaces
    .replace(/\s+/g, ' '); // Replace multiple spaces with single space
  
  try {
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error('JSON parsing failed, attempting to fix...', error);
    
    // Try to fix quotes
    jsonStr = jsonStr.replace(/([{,]\s*)([a-zA-Z_][a-zA-Z0-9_]*)\s*:/g, '$1"$2":');
    
    return JSON.parse(jsonStr);
  }
};

export const transcribeWithGemini = async ({ file, language }: TranscriptionOptions): Promise<TranscriptionLine[]> => {
  try {
    const apiKey = apiRateLimit.getAvailableApiKey();
    
    if (!apiKey) {
      throw new Error('Service temporarily unavailable. Please try again in a minute.');
    }

    console.log('Converting file to base64...');
    const base64Data = await fileToBase64(file);
    
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
    
    const prompt = `Transcribe this ${file.type.startsWith('audio/') ? 'audio' : 'video'} file and provide results in this exact JSON format:

{
  "transcription": [
    {
      "timestamp": "MM:SS",
      "startTime": 0,
      "endTime": 5,
      "text": "transcribed text here",
      "speaker": "Speaker 1",
      "confidence": 95
    }
  ]
}

Requirements:
- Break into natural sentence segments (3-8 seconds each)
- Include accurate timestamps in seconds
- Add speaker identification if multiple speakers
- Provide confidence scores (80-99)
- Target language: ${language === 'en' ? 'English' : language}
- Return ONLY valid JSON, no markdown or extra text`;

    console.log('Sending request to AI...');
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
    
    console.log('Raw AI response:', text);
    
    const parsedResponse = extractAndCleanJSON(text);
    
    if (!parsedResponse.transcription || !Array.isArray(parsedResponse.transcription)) {
      throw new Error('Invalid transcription format in response');
    }
    
    // Process the transcription data
    const transcriptionLines: TranscriptionLine[] = parsedResponse.transcription.map((item: any, index: number) => {
      const startTime = typeof item.startTime === 'number' ? item.startTime : parseTimestamp(item.timestamp);
      const endTime = typeof item.endTime === 'number' ? item.endTime : startTime + 5;
      
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
