
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
    console.log('=== STARTING TRANSCRIPTION PROCESS ===');
    console.log('Target language:', language, 'File:', file.name);
    
    // Step 1: Use Groq for initial transcription in original language
    const groq = new Groq({
      apiKey: GROQ_API_KEY,
      dangerouslyAllowBrowser: true,
    });

    console.log('Step 1: Transcribing with Groq Whisper...');
    
    const transcription = await groq.audio.transcriptions.create({
      file: file,
      model: "whisper-large-v3-turbo",
      response_format: "verbose_json",
      timestamp_granularities: ["word", "segment"],
      temperature: 0.0,
    });

    console.log('✓ Groq transcription completed:', transcription);

    // Step 2: Parse Groq response and extract segments with word-level timestamps
    const groqSegments = parseGroqTranscription(transcription);
    console.log('✓ Parsed Groq segments:', groqSegments.length);

    // Step 3: If target language is English, return as-is
    if (language === 'en') {
      console.log('✓ Target language is English, returning original transcription');
      return groqSegments;
    }

    // Step 4: Use Gemini for translation to target language
    console.log('Step 2: Translating ALL segments to target language:', getLanguageName(language));
    
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const targetLanguageName = getLanguageName(language);
    console.log('🔄 Starting translation process for', groqSegments.length, 'segments to:', targetLanguageName);

    // Create a comprehensive translation prompt with all segments
    const allSegmentTexts = groqSegments.map((segment, index) => 
      `Segment ${index + 1}: "${segment.text}"`
    ).join('\n');

    const comprehensivePrompt = `You are a professional translator. Translate ALL the following text segments from their original language to ${targetLanguageName}.

CRITICAL INSTRUCTIONS:
1. Translate each segment accurately to ${targetLanguageName}
2. Maintain the same meaning and context
3. Return ONLY the translated text for each segment, one per line
4. Do not add explanations, notes, or extra text
5. Keep the same number of segments as input

Original segments to translate:
${allSegmentTexts}

Expected format:
Segment 1 translation
Segment 2 translation
...and so on

Translate to: ${targetLanguageName}`;

    console.log('🔄 Sending comprehensive translation request to Gemini...');
    
    const result = await model.generateContent(comprehensivePrompt);
    const translatedResponse = result.response.text().trim();
    
    console.log('✓ Gemini translation response received:', translatedResponse);

    // Parse the translated response
    const translatedLines = translatedResponse.split('\n').filter(line => line.trim());
    
    console.log('✓ Parsed translated lines:', translatedLines.length);

    // Map translations back to segments
    const finalSegments = groqSegments.map((segment, index) => {
      const translatedText = translatedLines[index]?.trim() || segment.text;
      
      console.log(`Mapping segment ${index + 1}:`);
      console.log(`  Original: "${segment.text}"`);
      console.log(`  Translated: "${translatedText}"`);
      
      return {
        ...segment,
        text: translatedText,
      };
    });

    console.log('✓ Final translation complete. All segments processed:', finalSegments.length);
    console.log('=== TRANSCRIPTION PROCESS COMPLETE ===');
    
    return finalSegments;
  } catch (error) {
    console.error('❌ Transcription error:', error);
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
