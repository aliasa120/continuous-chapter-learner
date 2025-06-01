import Groq from 'groq-sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';

export interface TranscriptionLine {
  timestamp: string;
  text: string;
  startTime: number;
  endTime: number;
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
    console.log('Starting transcription with Groq + Gemini');
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

    // Step 3: If target language is English, return as-is
    if (language === 'en') {
      console.log('Target language is English, skipping translation');
      return groqSegments;
    }

    // Step 4: Use Gemini for translation to target language
    console.log('Step 2: Translating segments with Gemini to', getLanguageName(language));
    
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const targetLanguage = getLanguageName(language);
    console.log('Translating each segment to:', targetLanguage);

    // Translate each segment individually while preserving timestamps
    const translatedSegments = await Promise.all(
      groqSegments.map(async (segment, index) => {
        try {
          // Create a focused translation prompt for each segment
          const segmentPrompt = `Translate the following text to ${targetLanguage}. 
IMPORTANT: Only provide the direct translation, no explanations or additional text.
Text to translate: "${segment.text}"`;

          console.log(`Translating segment ${index + 1}/${groqSegments.length}: "${segment.text}" to ${targetLanguage}`);
          
          const result = await model.generateContent(segmentPrompt);
          const translatedText = result.response.text().trim();
          
          console.log(`Segment ${index + 1} translation result: "${translatedText}"`);
          
          return {
            ...segment,
            text: translatedText || segment.text, // Fallback to original if translation fails
          };
        } catch (error) {
          console.error(`Translation failed for segment ${index + 1}:`, error);
          return segment; // Return original segment if translation fails
        }
      })
    );

    console.log('All segments translated successfully:', translatedSegments.length);
    
    return translatedSegments;
  } catch (error) {
    console.error('Transcription error:', error);
    throw new Error('Transcription failed. Please check your API keys and try again.');
  }
};

const parseGroqTranscription = (transcription: any): TranscriptionLine[] => {
  const segments: TranscriptionLine[] = [];
  
  if (transcription.segments) {
    transcription.segments.forEach((segment: any, index: number) => {
      if (segment.text && segment.text.trim()) {
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
          confidence: Math.round((1 + (segment.avg_logprob || -0.5)) * 100),
          words,
        });
      }
    });
  }
  
  return segments;
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
