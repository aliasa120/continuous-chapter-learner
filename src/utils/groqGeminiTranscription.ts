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

// Language detection mapping for Groq Whisper
const getGroqLanguageCode = (targetLang: string): string => {
  const languageMap: { [key: string]: string } = {
    'ur': 'ur',  // Urdu
    'hi': 'hi',  // Hindi
    'ar': 'ar',  // Arabic
    'bn': 'bn',  // Bengali
    'en': 'en',  // English
    'es': 'es',  // Spanish
    'fr': 'fr',  // French
    'de': 'de',  // German
    'it': 'it',  // Italian
    'pt': 'pt',  // Portuguese
    'ru': 'ru',  // Russian
    'ja': 'ja',  // Japanese
    'ko': 'ko',  // Korean
    'zh': 'zh',  // Chinese
    'ta': 'ta',  // Tamil
    'te': 'te',  // Telugu
    'tr': 'tr',  // Turkish
    'nl': 'nl',  // Dutch
    'sv': 'sv',  // Swedish
    'da': 'da',  // Danish
    'no': 'no',  // Norwegian
    'fi': 'fi',  // Finnish
    'pl': 'pl',  // Polish
    'cs': 'cs',  // Czech
    'hu': 'hu',  // Hungarian
    'ro': 'ro',  // Romanian
    'bg': 'bg',  // Bulgarian
    'hr': 'hr',  // Croatian
    'sr': 'sr',  // Serbian
    'el': 'el',  // Greek
    'he': 'iw', // Hebrew (Groq uses 'iw')
    'fa': 'fa',  // Persian
    'uk': 'uk',  // Ukrainian
    'th': 'th',  // Thai
    'vi': 'vi',  // Vietnamese
    'id': 'id',  // Indonesian
    'ms': 'ms',  // Malay
    'tl': 'fil', // Filipino (Groq uses 'fil')
    'sw': 'sw',  // Swahili
  };
  
  return languageMap[targetLang] || 'en';
};

// Main transcription function with enhanced language detection
export const transcribeWithGroqAndGemini = async ({ file, language }: TranscriptionOptions): Promise<TranscriptionLine[]> => {
  try {
    console.log('=== STARTING ENHANCED TRANSCRIPTION PROCESS ===');
    console.log('Target language:', language, 'File:', file.name, 'Size:', (file.size / 1024 / 1024).toFixed(2), 'MB');
    
    // STEP 1: Get COMPLETE transcription from Groq Whisper
    const groq = new Groq({
      apiKey: GROQ_API_KEY,
      dangerouslyAllowBrowser: true,
    });

    console.log('STEP 1: Getting complete transcription from Groq Whisper...');
    
    const transcription = await groq.audio.transcriptions.create({
      file: file,
      model: "whisper-large-v3-turbo",
      response_format: "verbose_json",
      timestamp_granularities: ["word", "segment"],
      temperature: 0.0,
      language: getGroqLanguageCode(language), // Set expected language
    });

    console.log('✓ Groq transcription completed');
    console.log('Detected language:', transcription.language);
    console.log('Transcription data:', transcription);
    
    // Parse the complete transcription with all segments
    const originalSegments = parseGroqTranscription(transcription);
    console.log('✓ Parsed segments count:', originalSegments.length);
    console.log('First 3 segments:', originalSegments.slice(0, 3));
    
    if (originalSegments.length === 0) {
      throw new Error('No transcription segments found. The audio might be too quiet or empty.');
    }
    
    // Check if detected language matches target language
    const detectedLang = transcription.language || 'en';
    const targetLangCode = getGroqLanguageCode(language);
    
    console.log('Detected language code:', detectedLang);
    console.log('Target language code:', targetLangCode);
    
    // If languages match or target is English, return original segments
    if (detectedLang === targetLangCode || language === 'en') {
      console.log('Languages match or target is English - returning original segments without translation');
      return originalSegments;
    }
    
    // STEP 2: Translate ALL segments to target language using Gemini in ONE API call
    const targetLanguageName = getLanguageName(language);
    console.log('STEP 2: Translating all segments from', detectedLang, 'to', targetLanguageName, 'using Gemini...');
    
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    // Create translation prompt for ALL segments with timestamps
    const segmentsText = originalSegments.map((seg, idx) => 
      `[${seg.timestamp}] ${seg.text}`
    ).join('\n');

    const translationPrompt = `You are a professional translator. Translate the following transcript segments from ${getLanguageName(detectedLang)} to natural, fluent ${targetLanguageName}.

CRITICAL INSTRUCTIONS:
1. Translate EVERY segment below - do NOT skip any
2. Keep the EXACT same meaning and natural speaking style
3. Maintain the original length and flow of speech
4. Return translations in EXACT same order
5. Keep timestamps as they are - only translate the text after each timestamp
6. Do NOT summarize, condense, or skip anything
7. Preserve the conversational tone and speaker's style

SEGMENTS TO TRANSLATE (${originalSegments.length} total):
${segmentsText}

Return the translations in this EXACT format:
[timestamp] translated text
[timestamp] translated text
...and so on for all ${originalSegments.length} segments.

IMPORTANT: Return ONLY the translated segments with timestamps, nothing else.`;

    try {
      console.log('Sending all segments to Gemini for translation...');
      console.log('Translation prompt length:', translationPrompt.length);
      
      const result = await model.generateContent(translationPrompt);
      const translatedResponse = result.response.text().trim();
      
      console.log('✓ Gemini translation completed');
      console.log('Translation response:', translatedResponse);
      
      // Parse the translated response back to segments
      const translatedSegments = parseTranslatedResponse(translatedResponse, originalSegments);
      console.log('✓ Parsed translated segments count:', translatedSegments.length);
      console.log('First 3 translated segments:', translatedSegments.slice(0, 3));
      
      if (translatedSegments.length !== originalSegments.length) {
        console.warn('Translation count mismatch! Using fallback...');
        return originalSegments; // Fallback to original if translation failed
      }
      
      console.log('=== TRANSCRIPTION PROCESS COMPLETED SUCCESSFULLY ===');
      return translatedSegments;
      
    } catch (translationError) {
      console.error('❌ Translation error:', translationError);
      console.log('Falling back to original transcription');
      return originalSegments;
    }
  } catch (error) {
    console.error('❌ Transcription error:', error);
    throw new Error(`Transcription failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

// Parse the translated response back to structured segments
const parseTranslatedResponse = (response: string, originalSegments: TranscriptionLine[]): TranscriptionLine[] => {
  console.log('Parsing translated response...');
  
  const lines = response.split('\n').filter(line => line.trim());
  const translatedSegments: TranscriptionLine[] = [];
  
  for (let i = 0; i < originalSegments.length; i++) {
    const originalSegment = originalSegments[i];
    let translatedText = originalSegment.text; // Fallback to original
    
    // Try to find the corresponding translated line by timestamp
    for (const line of lines) {
      const timestampMatch = line.match(/^\[([^\]]+)\]\s*(.+)$/);
      if (timestampMatch) {
        const [, timestamp, text] = timestampMatch;
        if (timestamp === originalSegment.timestamp.replace(/^\[|\]$/g, '')) {
          translatedText = text.trim();
          break;
        }
      }
    }
    
    // If no match found by timestamp, try by index
    if (translatedText === originalSegment.text && lines[i]) {
      const lineMatch = lines[i].match(/^\[([^\]]+)\]\s*(.+)$/);
      if (lineMatch) {
        translatedText = lineMatch[2].trim();
      }
    }
    
    // Create translated segment with enhanced word timings
    const translatedWords = generateEnhancedWordTimings(
      translatedText, 
      originalSegment.startTime, 
      originalSegment.endTime,
      originalSegment.words || []
    );
    
    translatedSegments.push({
      timestamp: originalSegment.timestamp,
      text: translatedText,
      startTime: originalSegment.startTime,
      endTime: originalSegment.endTime,
      confidence: originalSegment.confidence || 95,
      words: translatedWords
    });
  }
  
  console.log(`Parsed ${translatedSegments.length}/${originalSegments.length} translated segments`);
  return translatedSegments;
};

// Enhanced parsing of Groq transcription to get ALL segments
const parseGroqTranscription = (transcription: any): TranscriptionLine[] => {
  console.log('Parsing Groq transcription...');
  console.log('Transcription object keys:', Object.keys(transcription));
  console.log('Segments count:', transcription.segments?.length || 0);
  console.log('Words count:', transcription.words?.length || 0);
  
  const segments: TranscriptionLine[] = [];
  
  if (transcription.segments && transcription.segments.length > 0) {
    transcription.segments.forEach((segment: any, index: number) => {
      if (segment.text && segment.text.trim()) {
        console.log(`Processing segment ${index + 1}:`, {
          start: segment.start,
          end: segment.end,
          text: segment.text.substring(0, 50) + '...'
        });
        
        // Extract word-level timestamps for this segment
        const segmentWords = transcription.words?.filter((word: any) => 
          word.start >= segment.start && word.end <= segment.end
        ).map((word: any) => ({
          word: word.word,
          start: word.start,
          end: word.end,
        })) || [];
        
        segments.push({
          timestamp: `[${formatTime(segment.start)}-${formatTime(segment.end)}]`,
          text: segment.text.trim(),
          startTime: segment.start,
          endTime: segment.end,
          confidence: Math.round((1 + (segment.avg_logprob || -0.5)) * 100),
          words: segmentWords.length > 0 ? segmentWords : generateEnhancedWordTimings(segment.text.trim(), segment.start, segment.end, []),
        });
      }
    });
  }
  
  console.log(`Parsed ${segments.length} segments from Groq transcription`);
  return segments;
};

// Enhanced word timing generation with better accuracy
const generateEnhancedWordTimings = (
  text: string, 
  startTime: number, 
  endTime: number, 
  originalWords: Array<{word: string; start: number; end: number}>
) => {
  const words = text.split(/\s+/).filter(Boolean);
  const duration = endTime - startTime;
  
  if (words.length === 0) return [];
  
  // If we have original word timings, try to distribute proportionally
  if (originalWords.length > 0) {
    const originalDuration = originalWords[originalWords.length - 1].end - originalWords[0].start;
    const timeScale = duration / Math.max(originalDuration, 1);
    
    return words.map((word, index) => {
      const progress = index / Math.max(words.length - 1, 1);
      const wordStart = startTime + (duration * progress * 0.9); // Leave some buffer
      const wordDuration = duration / words.length;
      
      return {
        word: word.replace(/[.,!?;:]$/, ''), // Clean punctuation
        start: wordStart,
        end: Math.min(wordStart + wordDuration, endTime),
      };
    });
  }
  
  // Fallback: even distribution
  const avgWordDuration = duration / words.length;
  
  return words.map((word, index) => {
    const wordStart = startTime + (avgWordDuration * index);
    const wordEnd = Math.min(wordStart + avgWordDuration, endTime);
    
    return {
      word: word.replace(/[.,!?;:]$/, ''),
      start: wordStart,
      end: wordEnd,
    };
  });
};

// Mobile device detection
const isMobileDevice = (): boolean => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
         window.innerWidth <= 768;
};

// File optimization for mobile
const optimizeFileForMobile = async (file: File): Promise<File> => {
  return new Promise((resolve) => {
    console.log('File optimization placeholder - returning original file');
    resolve(file);
  });
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

const formatTimeRange = (startTime: number, endTime: number): string => {
  return `${formatTime(startTime)}-${formatTime(endTime)}`;
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
