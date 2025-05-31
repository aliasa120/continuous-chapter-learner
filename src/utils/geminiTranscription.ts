
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
}

const HARDCODED_API_KEY = 'AIzaSyDcvqkBlNTX1mhT6y7e-BK6Ix-AdCbR95A';

export const transcribeWithGemini = async ({ file, language }: TranscriptionOptions): Promise<TranscriptionLine[]> => {
  try {
    console.log('Starting enhanced transcription with Gemini 2.5 Flash model');
    console.log('Target language:', language, 'File:', file.name);
    
    const ai = new GoogleGenAI({
      apiKey: HARDCODED_API_KEY,
    });

    const config = {
      thinkingConfig: {
        thinkingBudget: 0, // Non-thinking mode for faster processing
      },
      responseMimeType: 'text/plain',
    };

    const model = 'gemini-2.5-flash-preview-05-20';

    // Convert file to base64
    const fileData = await fileToBase64(file);
    
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

CRITICAL: ALL output text must be in ${targetLanguage} language regardless of source language.`;

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

    console.log('Sending enhanced transcription request to Gemini 2.5 Flash...');

    const response = await ai.models.generateContentStream({
      model,
      config,
      contents,
    });

    let transcriptionText = '';
    for await (const chunk of response) {
      if (chunk.text) {
        transcriptionText += chunk.text;
      }
    }
    
    console.log('Received enhanced transcription response:', transcriptionText);

    const parsedLines = parseEnhancedTranscription(transcriptionText);
    console.log('Parsed enhanced transcription lines:', parsedLines.length);
    
    return parsedLines;
  } catch (error) {
    console.error('Enhanced transcription error:', error);
    if (error instanceof Error && error.message.includes('API_KEY')) {
      throw new Error('API key authentication failed. Please contact support.');
    }
    throw new Error('Enhanced transcription failed. Please try again or contact support.');
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
