
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

// Language detection mapping for common languages
const getLanguageCode = (language: string): string => {
  const languageCodes: { [key: string]: string } = {
    'en': 'en',
    'es': 'es', 
    'fr': 'fr',
    'de': 'de',
    'it': 'it',
    'pt': 'pt',
    'ru': 'ru',
    'ja': 'ja',
    'ko': 'ko',
    'zh': 'zh',
    'ar': 'ar',
    'hi': 'hi',
    'ur': 'ur',
    'bn': 'bn',
    'ta': 'ta',
    'te': 'te',
    'mr': 'mr',
    'gu': 'gu',
    'kn': 'kn',
    'ml': 'ml',
    'pa': 'pa',
    'or': 'or',
    'as': 'as',
    'tr': 'tr',
    'fa': 'fa',
    'th': 'th',
    'vi': 'vi',
    'id': 'id',
    'ms': 'ms'
  };
  
  return languageCodes[language] || language;
};

export const transcribeWithGroqAndGemini = async ({ file, language }: TranscriptionOptions): Promise<TranscriptionLine[]> => {
  try {
    console.log('=== STARTING GROQ + GEMINI TRANSCRIPTION PROCESS ===');
    console.log('Target language:', language, 'File:', file.name);
    
    // Step 1: Use Groq for transcription with word-level timestamps
    const groq = new Groq({
      apiKey: GROQ_API_KEY,
      dangerouslyAllowBrowser: true,
    });

    console.log('Step 1: Getting complete transcription from Groq Whisper with timestamps...');
    
    const transcription = await groq.audio.transcriptions.create({
      file: file,
      model: "whisper-large-v3-turbo",
      response_format: "verbose_json",
      timestamp_granularities: ["word", "segment"],
      temperature: 0.0,
    });

    console.log('✓ Groq transcription completed successfully');
    console.log('Raw transcription data:', transcription);
    
    // Step 2: Parse segments from Groq response
    const groqSegments = parseGroqTranscription(transcription);
    console.log('✓ Parsed', groqSegments.length, 'segments from Groq');
    
    if (groqSegments.length === 0) {
      throw new Error('No transcription segments received from Groq');
    }

    // Step 3: Detect original language and check if translation is needed
    const originalLanguage = (transcription as any).language || 'en';
    const targetLanguageCode = getLanguageCode(language);
    
    console.log('Original language detected:', originalLanguage);
    console.log('Target language requested:', targetLanguageCode);
    
    // If languages are the same, return original transcription directly
    if (originalLanguage === targetLanguageCode || originalLanguage === language) {
      console.log('✓ Languages match - returning original transcription without translation');
      return groqSegments;
    }
    
    // Step 4: Translation needed - prepare full transcript for Gemini
    console.log('Step 2: Languages differ - preparing translation with Gemini...');
    
    const fullTranscript = groqSegments.map(segment => segment.text).join(' ');
    const segmentTimestamps = groqSegments.map(segment => ({
      start: segment.startTime,
      end: segment.endTime,
      originalText: segment.text
    }));
    
    console.log('Full transcript to translate:', fullTranscript);
    
    // Step 5: Use Gemini for translation with strict instructions
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    const targetLanguageName = getLanguageName(language);
    
    const strictTranslationPrompt = `You are a PROFESSIONAL TRANSLATOR for a transcription app. Your ONLY job is to translate text accurately.

CRITICAL RULES:
1. This is a TRANSCRIPTION APP - preserve ALL content exactly
2. NEVER summarize, reduce, or omit any text
3. NEVER add explanations or additional content
4. Translate EVERY word and sentence completely
5. Maintain the same number of sentences and structure
6. Preserve natural speech patterns and conversational tone
7. If already in target language, improve clarity but keep all content

TRANSCRIPT TO TRANSLATE:
Original Language: ${originalLanguage}
Target Language: ${targetLanguageName}
Number of segments: ${groqSegments.length}

Full transcript:
"${fullTranscript}"

TRANSLATE TO ${targetLanguageName} - Keep ALL content, same length, same meaning:`;

    console.log('🔄 Sending translation request to Gemini...');
    
    const result = await model.generateContent(strictTranslationPrompt);
    const translatedText = result.response.text().trim();
    
    console.log('✓ Translation completed');
    console.log('Translated text:', translatedText);
    
    // Step 6: Split translated text back into segments
    console.log('Step 3: Mapping translated text back to timestamps...');
    
    // Split translated text into sentences using multiple delimiters
    const sentences = translatedText.split(/([.!?।؟][\\s]|[.!?।؟]$)/).filter(s => s.trim());
    
    // Combine sentences back properly
    const translatedSentences: string[] = [];
    for (let i = 0; i < sentences.length; i += 2) {
      const sentence = sentences[i];
      const delimiter = sentences[i + 1] || '';
      if (sentence && sentence.trim()) {
        translatedSentences.push((sentence + delimiter).trim());
      }
    }
    
    console.log('Split into', translatedSentences.length, 'translated sentences');
    console.log('Original segments:', groqSegments.length);
    
    // Step 7: Map translated sentences to original timestamps
    const finalSegments: TranscriptionLine[] = [];
    
    if (translatedSentences.length === groqSegments.length) {
      // Perfect match - direct mapping
      for (let i = 0; i < groqSegments.length; i++) {
        const originalSegment = groqSegments[i];
        const translatedText = translatedSentences[i];
        
        finalSegments.push({
          ...originalSegment,
          text: translatedText,
          words: generateWordsFromTranslation(translatedText, originalSegment.startTime, originalSegment.endTime)
        });
      }
    } else {
      // Different counts - proportionally distribute
      console.log('Sentence count mismatch - using proportional distribution');
      
      const wordsPerOriginalSegment = groqSegments.map(s => s.text.split(/\s+/).length);
      const totalOriginalWords = wordsPerOriginalSegment.reduce((a, b) => a + b, 0);
      const translatedWords = translatedText.split(/\s+/);
      
      let translatedWordIndex = 0;
      
      for (let i = 0; i < groqSegments.length; i++) {
        const originalSegment = groqSegments[i];
        const originalWordCount = wordsPerOriginalSegment[i];
        const proportionalTranslatedWords = Math.round((originalWordCount / totalOriginalWords) * translatedWords.length);
        
        const segmentTranslatedWords = translatedWords.slice(
          translatedWordIndex, 
          translatedWordIndex + proportionalTranslatedWords
        );
        translatedWordIndex += proportionalTranslatedWords;
        
        const segmentTranslatedText = segmentTranslatedWords.join(' ');
        
        finalSegments.push({
          ...originalSegment,
          text: segmentTranslatedText,
          words: generateWordsFromTranslation(segmentTranslatedText, originalSegment.startTime, originalSegment.endTime)
        });
      }
    }
    
    console.log('✓ Created', finalSegments.length, 'translated segments with timestamps');
    console.log('=== TRANSCRIPTION PROCESS COMPLETED SUCCESSFULLY ===');
    
    return finalSegments;
    
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

// Enhanced AI explanation function with full context
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

// Enhanced AI summarization function with full context
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
