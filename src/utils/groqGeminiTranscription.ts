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

// Environment variables
const GROQ_API_KEY = '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';
const GEMINI_API_KEY = 'AIzaSyDcvqkBlNTX1mhT6y7e-BK6Ix-AdCbR95A';

// Language detection mapping
const getLanguageCode = (language: string): string => {
  const languageCodes: { [key: string]: string } = {
    'en': 'en', 'es': 'es', 'fr': 'fr', 'de': 'de', 'it': 'it', 'pt': 'pt',
    'ru': 'ru', 'ja': 'ja', 'ko': 'ko', 'zh': 'zh', 'ar': 'ar', 'hi': 'hi',
    'ur': 'ur', 'bn': 'bn', 'ta': 'ta', 'te': 'te', 'mr': 'mr', 'gu': 'gu',
    'kn': 'kn', 'ml': 'ml', 'pa': 'pa', 'or': 'or', 'as': 'as', 'tr': 'tr',
    'fa': 'fa', 'th': 'th', 'vi': 'vi', 'id': 'id', 'ms': 'ms'
  };
  return languageCodes[language] || language;
};

export const transcribeWithGroqAndGemini = async ({ file, language }: TranscriptionOptions): Promise<TranscriptionLine[]> => {
  try {
    console.log('=== STARTING TRANSCRIPTION PROCESS ===');
    console.log('Target language:', language, 'File:', file.name);
    
    // Step 1: Get complete transcription from Groq with timestamps
    const groq = new Groq({
      apiKey: GROQ_API_KEY,
      dangerouslyAllowBrowser: true,
    });

    console.log('Step 1: Getting complete transcription from Groq...');
    
    const transcription = await groq.audio.transcriptions.create({
      file: file,
      model: "whisper-large-v3-turbo",
      response_format: "verbose_json",
      timestamp_granularities: ["word", "segment"],
      temperature: 0.0,
    });

    console.log('✓ Groq transcription completed');
    console.log('Raw transcription:', transcription);
    
    // Step 2: Parse segments from Groq
    const originalSegments = parseGroqTranscription(transcription);
    console.log('✓ Parsed', originalSegments.length, 'segments from Groq');
    
    if (originalSegments.length === 0) {
      throw new Error('No transcription segments received from Groq');
    }

    // Step 3: Check if translation is needed
    const detectedLanguage = (transcription as any).language || 'en';
    const targetLanguageCode = getLanguageCode(language);
    
    console.log('Detected language:', detectedLanguage);
    console.log('Target language:', targetLanguageCode);
    
    // If languages are the same, return original segments directly
    if (detectedLanguage === targetLanguageCode || detectedLanguage === language) {
      console.log('✓ Languages match - returning original transcription');
      return originalSegments;
    }
    
    // Step 4: Translation needed - Get FULL text and translate it completely
    console.log('Step 2: Translation needed - using Gemini for full text translation...');
    
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    const targetLanguageName = getLanguageName(language);
    
    // Get the complete original text
    const fullOriginalText = originalSegments.map(segment => segment.text).join(' ');
    
    // Create a strict translation prompt for the FULL text
    const fullTextTranslationPrompt = `You are a PROFESSIONAL TRANSLATOR for a TRANSCRIPTION APPLICATION.

CRITICAL INSTRUCTIONS:
1. This is a TRANSCRIPTION - translate EVERY SINGLE WORD completely
2. NEVER summarize, reduce, omit, or change the meaning
3. NEVER add explanations or extra content
4. Translate the COMPLETE text maintaining all details
5. Keep the same speaking style and tone
6. Preserve all numbers, names, and technical terms appropriately

ORIGINAL TEXT (${detectedLanguage}):
"${fullOriginalText}"

TRANSLATE TO ${targetLanguageName}:
Provide ONLY the complete translation, nothing else.`;

    console.log('🔄 Sending full text translation request to Gemini...');
    
    const result = await model.generateContent(fullTextTranslationPrompt);
    const translatedFullText = result.response.text().trim();
    
    console.log('✓ Full text translation completed');
    console.log('Translated text:', translatedFullText);
    
    // Step 5: Map translated text back to original segments with preserved timing
    const translatedSegments = mapTranslationToSegments(translatedFullText, originalSegments);
    
    console.log('✓ Mapped', translatedSegments.length, 'translated segments');
    console.log('=== TRANSCRIPTION PROCESS COMPLETED ===');
    
    return translatedSegments;
    
  } catch (error) {
    console.error('❌ Transcription error:', error);
    throw new Error('Transcription failed. Please check your API keys and try again.');
  }
};

const parseGroqTranscription = (transcription: any): TranscriptionLine[] => {
  const segments: TranscriptionLine[] = [];
  
  if (transcription.segments) {
    transcription.segments.forEach((segment: any) => {
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

const mapTranslationToSegments = (translatedText: string, originalSegments: TranscriptionLine[]): TranscriptionLine[] => {
  // Split the translated text into words
  const translatedWords = translatedText.split(/\s+/).filter(Boolean);
  const originalTotalWords = originalSegments.reduce((total, segment) => 
    total + segment.text.split(/\s+/).filter(Boolean).length, 0
  );
  
  const translatedSegments: TranscriptionLine[] = [];
  let translatedWordIndex = 0;
  
  // Distribute translated words proportionally across original segments
  originalSegments.forEach((originalSegment, segmentIndex) => {
    const originalWords = originalSegment.text.split(/\s+/).filter(Boolean);
    const originalWordCount = originalWords.length;
    
    // Calculate how many translated words should go to this segment
    const proportionalWordCount = Math.round((originalWordCount / originalTotalWords) * translatedWords.length);
    const actualWordCount = Math.min(proportionalWordCount, translatedWords.length - translatedWordIndex);
    
    // Extract words for this segment
    const segmentTranslatedWords = translatedWords.slice(translatedWordIndex, translatedWordIndex + actualWordCount);
    const segmentTranslatedText = segmentTranslatedWords.join(' ');
    
    // Generate word-level timing for translated words
    const translatedWordsWithTiming = generateWordsFromTranslation(
      segmentTranslatedText, 
      originalSegment.startTime, 
      originalSegment.endTime
    );
    
    translatedSegments.push({
      ...originalSegment,
      text: segmentTranslatedText || originalSegment.text, // Fallback to original if no translation
      words: translatedWordsWithTiming,
    });
    
    translatedWordIndex += actualWordCount;
  });
  
  return translatedSegments;
};

const generateWordsFromTranslation = (text: string, startTime: number, endTime: number) => {
  const words = text.split(/\s+/).filter(Boolean);
  const duration = endTime - startTime;
  const wordDuration = words.length > 0 ? duration / words.length : 0;
  
  return words.map((word, index) => ({
    word,
    start: startTime + (wordDuration * index),
    end: startTime + (wordDuration * (index + 1)),
  }));
};

const getLanguageName = (lang: string): string => {
  const languageNames: { [key: string]: string } = {
    'en': 'English', 'es': 'Spanish', 'fr': 'French', 'de': 'German', 'it': 'Italian',
    'pt': 'Portuguese', 'ru': 'Russian', 'ja': 'Japanese', 'ko': 'Korean', 'zh': 'Chinese',
    'ar': 'Arabic', 'hi': 'Hindi', 'bn': 'Bengali', 'ur': 'Urdu', 'ta': 'Tamil',
    'te': 'Telugu', 'mr': 'Marathi', 'gu': 'Gujarati', 'kn': 'Kannada', 'ml': 'Malayalam',
    'pa': 'Punjabi', 'or': 'Odia', 'as': 'Assamese', 'sd': 'Sindhi', 'si': 'Sinhala',
    'my': 'Myanmar', 'th': 'Thai', 'vi': 'Vietnamese', 'id': 'Indonesian', 'ms': 'Malay',
    'tl': 'Tagalog', 'sw': 'Swahili', 'tr': 'Turkish', 'nl': 'Dutch', 'sv': 'Swedish',
    'da': 'Danish', 'no': 'Norwegian', 'fi': 'Finnish', 'pl': 'Polish', 'cs': 'Czech',
    'hu': 'Hungarian', 'ro': 'Romanian', 'bg': 'Bulgarian', 'hr': 'Croatian', 'sr': 'Serbian',
    'el': 'Greek', 'he': 'Hebrew', 'fa': 'Persian', 'uk': 'Ukrainian'
  };
  return languageNames[lang] || 'English';
};

const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

// Enhanced AI explanation function
export const explainTextWithAI = async (text: string, language: string, fullTranscription?: string): Promise<string> => {
  try {
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    const targetLanguageName = getLanguageName(language);
    
    const contextualPrompt = fullTranscription 
      ? `Given this full transcription context:
"${fullTranscription}"

Please explain this specific part in ${targetLanguageName}:
"${text}"

Provide a clear, contextual explanation in ${targetLanguageName}:`
      : `Explain the following text clearly and simply in ${targetLanguageName}:

"${text}"

Provide a brief, easy-to-understand explanation in ${targetLanguageName}:`;

    const result = await model.generateContent(contextualPrompt);
    return result.response.text().trim();
  } catch (error) {
    console.error('AI explanation error:', error);
    throw new Error('Failed to generate explanation');
  }
};

// Enhanced AI summarization function
export const summarizeTextWithAI = async (text: string, language: string, fullTranscription?: string): Promise<string> => {
  try {
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    const targetLanguageName = getLanguageName(language);
    
    const contextualPrompt = fullTranscription 
      ? `Given this full transcription context:
"${fullTranscription}"

Please summarize this specific part in ${targetLanguageName}:
"${text}"

Provide a concise, contextual summary in ${targetLanguageName}:`
      : `Summarize the following text concisely in ${targetLanguageName}:

"${text}"

Provide a brief summary capturing the key points in ${targetLanguageName}:`;

    const result = await model.generateContent(contextualPrompt);
    return result.response.text().trim();
  } catch (error) {
    console.error('AI summarization error:', error);
    throw new Error('Failed to generate summary');
  }
};
