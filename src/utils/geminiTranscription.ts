
import { GoogleGenAI } from '@google/genai';

export interface TranscriptionLine {
  timestamp: string;
  text: string;
  startTime: number;
  endTime: number;
  speaker?: string;
  confidence?: number;
}

export interface TranscriptionOptions {
  file: File;
  language: string;
  onProgress?: (progress: number) => void;
}

const HARDCODED_API_KEY = 'AIzaSyDcvqkBlNTX1mhT6y7e-BK6Ix-AdCbR95A';

export const transcribeWithGemini = async ({ file, language, onProgress }: TranscriptionOptions): Promise<TranscriptionLine[]> => {
  try {
    console.log('Starting transcription with Gemini 2.5 Flash Preview');
    console.log('Target language:', language, 'File:', file.name, 'Size:', file.size, 'Type:', file.type);
    
    onProgress?.(5);
    
    const ai = new GoogleGenAI({
      apiKey: HARDCODED_API_KEY,
    });

    const model = 'gemini-2.0-flash-lite';
    console.log('Using model:', model);

    onProgress?.(15);

    // Convert file to base64 with progress
    console.log('Converting file to base64...');
    const fileData = await fileToBase64(file);
    console.log('File converted to base64, size:', fileData.length);
    
    onProgress?.(30);
    
    const targetLanguage = getLanguageName(language);
    console.log('Target language for transcription:', targetLanguage);
    
    const enhancedPrompt = `You are an expert AI transcription and translation system with advanced capabilities.

TASK: Transcribe and translate the audio/video content with maximum accuracy.

TARGET LANGUAGE: ${targetLanguage}

CRITICAL REQUIREMENTS:
1. TRANSCRIBE every word spoken in the audio/video
2. TRANSLATE all content to ${targetLanguage} language (even if some parts are already in ${targetLanguage})
3. IDENTIFY different speakers with high accuracy (Speaker A, Speaker B, etc.)
4. PROVIDE precise timestamps for perfect audio synchronization
5. ESTIMATE confidence levels for each segment
6. HANDLE overlapping speech and background noise intelligently
7. MAINTAIN context and meaning during translation

OUTPUT FORMAT (EXACTLY as shown):
[00:00-00:05] Speaker A (95%): [Translated text in ${targetLanguage}]
[00:05-00:12] Speaker B (92%): [Translated text in ${targetLanguage}]
[00:12-00:18] Speaker A (98%): [Translated text in ${targetLanguage}]

ENHANCED FEATURES:
- Use start-end timestamps for better synchronization
- Include confidence percentages in parentheses
- Detect speaker changes automatically
- Handle multiple languages in source audio
- Preserve emotional tone and context in translation
- Filter out background noise descriptions

CRITICAL: ALL output text must be in ${targetLanguage} language regardless of source language.
IMPORTANT: Always provide timestamps and speaker information for every segment.
IMPORTANT: If no speech is detected, respond with: "No speech detected in this audio/video file."`;

    const contents = [
      {
        role: 'user',
        parts: [
          {
            text: enhancedPrompt,
          },
          {
            inlineData: {
              mimeType: file.type,
              data: fileData
            }
          }
        ],
      },
    ];

    console.log('Sending transcription request to Gemini model...');
    onProgress?.(40);

    const response = await ai.models.generateContentStream({
      model,
      contents,
      config: {
        responseMimeType: 'text/plain',
        temperature: 0.1,
        topP: 0.8,
        topK: 40,
        maxOutputTokens: 8192,
      }
    });

    let transcriptionText = '';
    let chunkCount = 0;
    
    console.log('Receiving transcription response...');
    for await (const chunk of response) {
      if (chunk.text) {
        transcriptionText += chunk.text;
        chunkCount++;
        
        // Update progress based on chunks received
        const progress = Math.min(95, 40 + (chunkCount * 2));
        onProgress?.(progress);
        
        console.log(`Received chunk ${chunkCount}, current text length: ${transcriptionText.length}`);
      }
    }
    
    console.log('Full transcription response received. Total length:', transcriptionText.length);
    console.log('Raw transcription text:', transcriptionText);
    onProgress?.(98);

    if (!transcriptionText.trim()) {
      console.error('No transcription content received from the API');
      throw new Error('No transcription content received from the API. The file might be too large or contain no speech.');
    }

    // Check for "no speech detected" response
    if (transcriptionText.toLowerCase().includes('no speech detected')) {
      console.log('No speech detected in the file');
      throw new Error('No speech was detected in this audio/video file. Please check if the file contains clear audio.');
    }

    const parsedLines = parseEnhancedTranscription(transcriptionText);
    console.log('Parsed transcription lines:', parsedLines.length);
    
    if (parsedLines.length === 0) {
      console.warn('No valid transcription lines parsed, trying fallback parsing...');
      // Try basic parsing as fallback
      const fallbackLines = parseBasicTranscription(transcriptionText);
      if (fallbackLines.length > 0) {
        console.log('Fallback parsing successful:', fallbackLines.length, 'lines');
        onProgress?.(100);
        return fallbackLines;
      }
      console.error('Both enhanced and fallback parsing failed');
      throw new Error('Failed to parse transcription response. The audio might be unclear or contain no speech.');
    }
    
    onProgress?.(100);
    console.log('Transcription completed successfully with', parsedLines.length, 'segments');
    return parsedLines;
  } catch (error) {
    console.error('Transcription error:', error);
    onProgress?.(0);
    
    if (error instanceof Error) {
      if (error.message.includes('API_KEY') || error.message.includes('403')) {
        throw new Error('API key authentication failed. Please contact support.');
      }
      if (error.message.includes('quota') || error.message.includes('429')) {
        throw new Error('API quota exceeded. Please try again later.');
      }
      if (error.message.includes('file size') || error.message.includes('too large') || error.message.includes('413')) {
        throw new Error('File size too large. Please use a smaller file (max 100MB).');
      }
      if (error.message.includes('no speech') || error.message.includes('No speech')) {
        throw error; // Re-throw the specific error message
      }
    }
    
    throw new Error('Transcription failed. Please check if your file contains clear audio and try again.');
  }
};

const parseEnhancedTranscription = (text: string): TranscriptionLine[] => {
  const lines = text.split('\n').filter(line => line.trim());
  const transcriptionLines: TranscriptionLine[] = [];

  lines.forEach((line, index) => {
    console.log(`Parsing enhanced line ${index}:`, line);
    
    // Match enhanced patterns like [00:00-00:05] Speaker A (95%): text
    const enhancedMatch = line.match(/\[(\d{1,2}:\d{2}(?::\d{2})?)-(\d{1,2}:\d{2}(?::\d{2})?)\]\s*(Speaker [A-Z]|Speaker \d+)\s*\((\d+)%\):\s*(.*)/i);
    
    if (enhancedMatch) {
      const [, startTimeStr, endTimeStr, speaker, confidence, text] = enhancedMatch;
      
      if (text.trim()) {
        const transcriptionLine = {
          timestamp: `${formatTimestamp(startTimeStr)}-${formatTimestamp(endTimeStr)}`,
          text: text.trim(),
          startTime: parseTimeToSeconds(startTimeStr),
          endTime: parseTimeToSeconds(endTimeStr),
          speaker: speaker,
          confidence: parseInt(confidence)
        };
        
        console.log('Parsed enhanced line:', transcriptionLine);
        transcriptionLines.push(transcriptionLine);
      }
    } else {
      // Fallback to basic format parsing
      const basicMatch = line.match(/\[(\d{1,2}:\d{2}(?::\d{2})?)\]/);
      if (basicMatch) {
        const timeStr = basicMatch[1];
        const restOfLine = line.substring(basicMatch.index! + basicMatch[0].length).trim();
        
        const speakerMatch = restOfLine.match(/^(Speaker [A-Z]|Speaker \d+):\s*(.*)/i);
        let speaker: string | undefined;
        let text: string;

        if (speakerMatch) {
          speaker = speakerMatch[1];
          text = speakerMatch[2];
        } else {
          text = restOfLine.replace(/^:\s*/, '');
        }

        if (text.trim()) {
          const startTime = parseTimeToSeconds(timeStr);
          const transcriptionLine = {
            timestamp: formatTimestamp(timeStr),
            text: text.trim(),
            startTime,
            endTime: startTime + 5, // Default 5-second duration
            speaker,
            confidence: 90 // Default confidence
          };
          
          console.log('Parsed basic line:', transcriptionLine);
          transcriptionLines.push(transcriptionLine);
        }
      }
    }
  });

  return transcriptionLines;
};

// Fallback basic parsing
const parseBasicTranscription = (text: string): TranscriptionLine[] => {
  const lines = text.split('\n').filter(line => line.trim());
  const transcriptionLines: TranscriptionLine[] = [];
  let currentTime = 0;

  lines.forEach((line, index) => {
    const cleanText = line.trim();
    if (cleanText && !cleanText.startsWith('[') && cleanText.length > 3) {
      const transcriptionLine = {
        timestamp: formatTime(currentTime),
        text: cleanText,
        startTime: currentTime,
        endTime: currentTime + 5,
        speaker: 'Speaker A',
        confidence: 85
      };
      
      transcriptionLines.push(transcriptionLine);
      currentTime += 5;
    }
  });

  return transcriptionLines;
};

const getLanguageName = (lang: string): string => {
  const languageNames: { [key: string]: string } = {
    'en': 'English',
    'es': 'Spanish',
    'fr': 'French',
    'de': 'German',
    'it': 'Italian',
    'pt': 'Portuguese',
    'ru': 'Russian',
    'ja': 'Japanese',
    'ko': 'Korean',
    'zh': 'Chinese',
    'ar': 'Arabic',
    'hi': 'Hindi',
    'bn': 'Bengali',
    'ur': 'Urdu',
    'ta': 'Tamil',
    'te': 'Telugu',
    'mr': 'Marathi',
    'gu': 'Gujarati',
    'kn': 'Kannada',
    'ml': 'Malayalam',
    'pa': 'Punjabi',
    'or': 'Odia',
    'as': 'Assamese',
    'sd': 'Sindhi',
    'si': 'Sinhala',
    'my': 'Myanmar (Burmese)',
    'th': 'Thai',
    'vi': 'Vietnamese',
    'id': 'Indonesian',
    'ms': 'Malay',
    'tl': 'Tagalog',
    'sw': 'Swahili',
    'am': 'Amharic',
    'ha': 'Hausa',
    'yo': 'Yoruba',
    'ig': 'Igbo',
    'zu': 'Zulu',
    'af': 'Afrikaans',
    'nl': 'Dutch',
    'sv': 'Swedish',
    'da': 'Danish',
    'no': 'Norwegian',
    'fi': 'Finnish',
    'et': 'Estonian',
    'lv': 'Latvian',
    'lt': 'Lithuanian',
    'pl': 'Polish',
    'cs': 'Czech',
    'sk': 'Slovak',
    'hu': 'Hungarian',
    'ro': 'Romanian',
    'bg': 'Bulgarian',
    'hr': 'Croatian',
    'sr': 'Serbian',
    'bs': 'Bosnian',
    'mk': 'Macedonian',
    'sq': 'Albanian',
    'el': 'Greek',
    'tr': 'Turkish',
    'az': 'Azerbaijani',
    'ka': 'Georgian',
    'hy': 'Armenian',
    'he': 'Hebrew',
    'fa': 'Persian',
    'ku': 'Kurdish',
    'ps': 'Pashto',
    'uz': 'Uzbek',
    'kk': 'Kazakh',
    'ky': 'Kyrgyz',
    'tg': 'Tajik',
    'mn': 'Mongolian',
    'ne': 'Nepali',
    'km': 'Khmer',
    'lo': 'Lao'
  };
  
  return languageNames[lang] || 'English';
};

const parseTimeToSeconds = (timeStr: string): number => {
  const parts = timeStr.split(':').map(Number);
  if (parts.length === 2) {
    return parts[0] * 60 + parts[1];
  } else if (parts.length === 3) {
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  }
  return 0;
};

const formatTimestamp = (timeStr: string): string => {
  const parts = timeStr.split(':');
  if (parts.length === 2) {
    return `00:${timeStr}`;
  }
  return timeStr;
};

const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = error => reject(error);
  });
};
