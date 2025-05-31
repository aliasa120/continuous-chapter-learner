
import { GoogleGenerativeAI } from '@google/generative-ai';

export interface TranscriptionLine {
  timestamp: string;
  text: string;
  startTime: number;
  speaker?: string;
}

export interface TranscriptionOptions {
  file: File;
  language: string;
  apiKey: string;
}

export const transcribeWithGemini = async ({ file, language, apiKey }: TranscriptionOptions): Promise<TranscriptionLine[]> => {
  try {
    console.log('Starting transcription with language:', language, 'API Key provided:', !!apiKey);
    
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite" });

    // Convert file to base64
    const fileData = await fileToBase64(file);
    
    // Create comprehensive language mapping
    const getLanguagePrompt = (lang: string) => {
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

    const targetLanguage = getLanguagePrompt(language);
    console.log('Target language for transcription:', targetLanguage);
    
    const prompt = `You are an expert audio/video transcription and translation AI. Your task is to:

1. TRANSCRIBE the audio/video content accurately
2. TRANSLATE everything to ${targetLanguage} language
3. IDENTIFY different speakers if present
4. PROVIDE accurate timestamps

CRITICAL INSTRUCTIONS:
- If the original audio is in ANY language (Hindi, English, Urdu, etc.), you MUST translate ALL content to ${targetLanguage}
- Even if some words are already in ${targetLanguage}, translate the entire content for consistency
- Include timestamps in format [MM:SS] or [HH:MM:SS]
- If multiple speakers are detected, label them as "Speaker 1", "Speaker 2", etc.
- Output ONLY in ${targetLanguage} language
- Be accurate with timestamps and speaker identification

Format your response EXACTLY like this:
[00:02] Speaker 1: [Translation in ${targetLanguage}]
[00:08] Speaker 2: [Translation in ${targetLanguage}]
[00:14] Speaker 1: [Translation in ${targetLanguage}]

IMPORTANT: ALL text must be in ${targetLanguage}, regardless of the original language.`;

    console.log('Sending transcription request to Gemini...');

    const result = await model.generateContent([
      {
        text: prompt
      },
      {
        inlineData: {
          mimeType: file.type,
          data: fileData
        }
      }
    ]);

    const response = await result.response;
    const transcriptionText = response.text();
    
    console.log('Received transcription response:', transcriptionText);

    const parsedLines = parseTranscription(transcriptionText);
    console.log('Parsed transcription lines:', parsedLines.length);
    
    return parsedLines;
  } catch (error) {
    console.error('Transcription error:', error);
    if (error instanceof Error && error.message.includes('API_KEY')) {
      throw new Error('Invalid API key. Please check your Google Gemini API key and try again.');
    }
    throw new Error('Failed to transcribe audio. Please check your API key and try again.');
  }
};

const parseTranscription = (text: string): TranscriptionLine[] => {
  const lines = text.split('\n').filter(line => line.trim());
  const transcriptionLines: TranscriptionLine[] = [];

  lines.forEach((line, index) => {
    console.log(`Parsing line ${index}:`, line);
    
    // Match patterns like [00:02] Speaker 1: text or [00:02] text
    const timeMatch = line.match(/\[(\d{1,2}:\d{2}(?::\d{2})?)\]/);
    if (timeMatch) {
      const timeStr = timeMatch[1];
      const restOfLine = line.substring(timeMatch.index! + timeMatch[0].length).trim();
      
      // Check for speaker identification
      const speakerMatch = restOfLine.match(/^(Speaker \d+|speaker \d+):\s*(.*)/i);
      let speaker: string | undefined;
      let text: string;

      if (speakerMatch) {
        speaker = speakerMatch[1];
        text = speakerMatch[2];
      } else {
        text = restOfLine.replace(/^:\s*/, ''); // Remove leading colon if present
      }

      if (text.trim()) {
        const transcriptionLine = {
          timestamp: formatTimestamp(timeStr),
          text: text.trim(),
          startTime: parseTimeToSeconds(timeStr),
          speaker
        };
        
        console.log('Parsed line:', transcriptionLine);
        transcriptionLines.push(transcriptionLine);
      }
    }
  });

  return transcriptionLines;
};

const parseTimeToSeconds = (timeStr: string): number => {
  const parts = timeStr.split(':').map(Number);
  if (parts.length === 2) {
    // MM:SS format
    return parts[0] * 60 + parts[1];
  } else if (parts.length === 3) {
    // HH:MM:SS format
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
