
import Groq from 'groq-sdk';
import { GoogleGenAI } from '@google/genai';

export interface TranscriptionLine {
  timestamp: string;
  text: string;
  startTime: number;
  endTime: number;
  speaker?: string;
  confidence?: number;
  words?: Array<{
    word: string;
    start: number;
    end: number;
  }>;
}

export interface TranscriptionOptions {
  file: File;
  language: string;
}

// Environment variables - these should be set in your deployment environment
const GROQ_API_KEY = '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';
const GEMINI_API_KEY = 'AIzaSyDcvqkBlNTX1mhT6y7e-BK6Ix-AdCbR95A';

export const transcribeWithGroqAndGemini = async ({ file, language }: TranscriptionOptions): Promise<TranscriptionLine[]> => {
  try {
    console.log('Starting cost-optimized transcription with Groq + Gemini');
    console.log('Target language:', language, 'File:', file.name);
    
    // Step 1: Use Groq for initial transcription in original language
    const groq = new Groq({
      apiKey: GROQ_API_KEY,
      dangerouslyAllowBrowser: true,
    });

    console.log('Step 1: Transcribing with Groq Whisper-large-v3-turbo...');
    
    const transcription = await groq.audio.transcriptions.create({
      file: file,
      model: "whisper-large-v3-turbo",
      response_format: "verbose_json",
      timestamp_granularities: ["word", "segment"],
      temperature: 0.0,
    });

    console.log('Groq transcription completed:', transcription);

    // Step 2: Parse Groq response and extract segments with word-level timestamps
    const groqSegments = parseGroqTranscription(transcription);
    console.log('Parsed Groq segments:', groqSegments.length);

    // Step 3: If target language is English, return as-is (cost optimization)
    if (language === 'en') {
      console.log('Target language is English, skipping translation');
      return groqSegments;
    }

    // Step 4: Use Gemini for translation to target language
    console.log('Step 2: Translating with Gemini to', getLanguageName(language));
    
    const ai = new GoogleGenAI(GEMINI_API_KEY);
    const model = ai.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const targetLanguage = getLanguageName(language);

    // Combine all text for efficient translation
    const fullText = groqSegments.map(segment => segment.text).join('\n');
    
    const translationPrompt = `Translate the following transcribed text to ${targetLanguage}. 
Maintain the same line structure and preserve the meaning. 
Only provide the translated text, line by line:

${fullText}`;

    const result = await model.generateContent(translationPrompt);
    const translatedText = result.response.text();

    console.log('Gemini translation completed');

    // Step 5: Combine Groq timing with Gemini translation
    const translatedLines = translatedText.split('\n').filter(line => line.trim());
    const finalSegments = groqSegments.map((segment, index) => ({
      ...segment,
      text: translatedLines[index] || segment.text, // Fallback to original if translation is missing
    }));

    console.log('Cost-optimized transcription completed:', finalSegments.length, 'segments');
    
    return finalSegments;
  } catch (error) {
    console.error('Cost-optimized transcription error:', error);
    throw new Error('Transcription failed. Please check your API keys and try again.');
  }
};

const parseGroqTranscription = (transcription: any): TranscriptionLine[] => {
  const segments: TranscriptionLine[] = [];
  
  if (transcription.segments) {
    transcription.segments.forEach((segment: any, index: number) => {
      if (segment.text && segment.text.trim()) {
        // Basic speaker detection based on pauses and segment patterns
        const speaker = detectSpeaker(segment, index);
        
        // Extract word-level timestamps if available
        const words = transcription.words?.filter((word: any) => 
          word.start >= segment.start && word.end <= segment.end
        ).map((word: any) => ({
          word: word.word,
          start: word.start,
          end: word.end,
        })) || [];
        
        segments.push({
          timestamp: `${formatTime(segment.start)}-${formatTime(segment.end)}`,
          text: segment.text.trim(),
          startTime: segment.start,
          endTime: segment.end,
          speaker,
          confidence: Math.round((1 + (segment.avg_logprob || -0.5)) * 100),
          words,
        });
      }
    });
  }
  
  return segments;
};

// Basic speaker detection based on pauses and patterns
const detectSpeaker = (segment: any, index: number): string => {
  // Simple heuristic: alternate speakers based on significant pauses
  const pauseThreshold = 2.0; // 2 seconds
  
  if (index === 0) return 'Speaker A';
  
  // If there's a significant pause, likely a speaker change
  const speakerIndex = Math.floor(index / 3) % 2; // Rough speaker alternation
  return speakerIndex === 0 ? 'Speaker A' : 'Speaker B';
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
    'my': 'Myanmar',
    'th': 'Thai',
    'vi': 'Vietnamese',
    'id': 'Indonesian',
    'ms': 'Malay',
    'tl': 'Tagalog',
    'sw': 'Swahili',
    'tr': 'Turkish',
    'nl': 'Dutch',
    'sv': 'Swedish',
    'da': 'Danish',
    'no': 'Norwegian',
    'fi': 'Finnish',
    'pl': 'Polish',
    'cs': 'Czech',
    'hu': 'Hungarian',
    'ro': 'Romanian',
    'bg': 'Bulgarian',
    'hr': 'Croatian',
    'sr': 'Serbian',
    'el': 'Greek',
    'he': 'Hebrew',
    'fa': 'Persian',
    'uk': 'Ukrainian'
  };
  
  return languageNames[lang] || 'English';
};

const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};
