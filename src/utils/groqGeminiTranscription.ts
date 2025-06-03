
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

// Enhanced transcription with single API calls
export const transcribeWithGroqAndGemini = async ({ file, language }: TranscriptionOptions): Promise<TranscriptionLine[]> => {
  try {
    console.log('=== ENHANCED TRANSCRIPTION WITH SINGLE API CALLS ===');
    console.log('Target language:', language, 'File:', file.name, 'Size:', (file.size / 1024 / 1024).toFixed(2), 'MB');
    
    // Mobile optimization: Check file size and compress if needed
    const maxMobileFileSize = 25 * 1024 * 1024; // 25MB for mobile
    let processedFile = file;
    
    if (file.size > maxMobileFileSize && isMobileDevice()) {
      console.log('Large file detected on mobile, optimizing...');
      processedFile = await optimizeFileForMobile(file);
    }
    
    // Step 1: Use Groq for transcription with word-level timestamps
    const groq = new Groq({
      apiKey: GROQ_API_KEY,
      dangerouslyAllowBrowser: true,
    });

    console.log('Step 1: Getting original transcription with word timestamps from Groq...');
    
    const transcription = await groq.audio.transcriptions.create({
      file: processedFile,
      model: "whisper-large-v3-turbo",
      response_format: "verbose_json",
      timestamp_granularities: ["word", "segment"],
      temperature: 0.0,
    });

    console.log('✓ Groq transcription completed');
    
    // Extract original segments with word-level timing
    const originalSegments = parseGroqTranscription(transcription);
    console.log('Original segments count:', originalSegments.length);
    console.log('First few segments:', originalSegments.slice(0, 3));
    
    // If target language is English, return original segments
    if (language === 'en') {
      console.log('Target language is English, returning original segments');
      return originalSegments;
    }
    
    // Step 2: Use Gemini for translation in a SINGLE API call
    const targetLanguageName = getLanguageName(language);
    console.log('Step 2: Using Gemini for translation to', targetLanguageName, 'in single API call');
    
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    // Create comprehensive translation prompt for ALL segments at once
    const allSegmentsPrompt = `You are a professional translator. Your task is to translate ALL the following transcript segments from the original language to natural, fluent ${targetLanguageName}. 

CRITICAL RULES:
1. Translate EVERY segment listed below - do NOT skip any
2. Maintain EXACT same meaning and natural length
3. Keep the same speaking style and tone
4. Preserve all details - do NOT summarize or condense
5. Return translations in the EXACT same order as provided
6. Use natural ${targetLanguageName} expressions

SEGMENTS TO TRANSLATE (${originalSegments.length} total):
${originalSegments.map((seg, idx) => `${idx + 1}. [${seg.timestamp}] "${seg.text}"`).join('\n')}

Please translate each segment to natural ${targetLanguageName} and return them in this format:
1. [translated text for segment 1]
2. [translated text for segment 2]
...and so on for all ${originalSegments.length} segments.

IMPORTANT: Return ONLY the numbered translations, nothing else.`;

    try {
      console.log('Sending all segments to Gemini for translation...');
      const result = await model.generateContent(allSegmentsPrompt);
      const translatedText = result.response.text().trim();
      
      console.log('✓ Gemini translation completed');
      console.log('Translation response length:', translatedText.length);
      
      // Parse ALL translations from the single response
      const translations = parseAllTranslations(translatedText, originalSegments.length);
      console.log('Parsed translations count:', translations.length);
      
      // Create translated segments with enhanced timing
      const translatedSegments: TranscriptionLine[] = originalSegments.map((originalSegment, index) => {
        const translation = translations[index] || originalSegment.text;
        
        // Generate enhanced word timings for translated text
        const translatedWords = generateEnhancedWordTimings(
          translation, 
          originalSegment.startTime, 
          originalSegment.endTime,
          originalSegment.words || []
        );
        
        return {
          timestamp: originalSegment.timestamp,
          text: translation,
          startTime: originalSegment.startTime,
          endTime: originalSegment.endTime,
          confidence: 95, // High confidence for AI translation
          words: translatedWords
        };
      });
      
      console.log('✓ Translation mapping completed');
      console.log('Final segments count:', translatedSegments.length);
      console.log('First few translated segments:', translatedSegments.slice(0, 3));
      console.log('=== TRANSCRIPTION PROCESS COMPLETED ===');
      
      return translatedSegments;
      
    } catch (translationError) {
      console.error('❌ Translation error:', translationError);
      // Fallback to original segments with high confidence
      return originalSegments.map(segment => ({
        ...segment,
        confidence: 85
      }));
    }
  } catch (error) {
    console.error('❌ Transcription error:', error);
    throw new Error('Transcription failed. Please check your connection and try again.');
  }
};

// Parse ALL translations from a single Gemini response
const parseAllTranslations = (text: string, expectedCount: number): string[] => {
  console.log('Parsing translations from response...');
  const lines = text.split('\n').filter(line => line.trim());
  const translations: string[] = [];
  
  // Try to find numbered patterns like "1. text" or "1) text"
  for (let i = 1; i <= expectedCount; i++) {
    const pattern = new RegExp(`^${i}[.)\\s]+(.+)`, 'i');
    let foundTranslation = '';
    
    // Look for the numbered line
    for (const line of lines) {
      const match = line.trim().match(pattern);
      if (match) {
        foundTranslation = match[1].trim();
        // Remove any remaining brackets or formatting
        foundTranslation = foundTranslation.replace(/^\[|\]$/g, '').trim();
        break;
      }
    }
    
    // If not found, try to get from lines array by index
    if (!foundTranslation && lines[i - 1]) {
      foundTranslation = lines[i - 1].replace(/^\d+[.)]\s*/, '').replace(/^\[|\]$/g, '').trim();
    }
    
    translations.push(foundTranslation || `Translation ${i} not found`);
  }
  
  console.log(`Parsed ${translations.length}/${expectedCount} translations`);
  return translations;
};

// Enhanced word timing generation with better accuracy
const generateEnhancedWordTimings = (
  translatedText: string, 
  startTime: number, 
  endTime: number, 
  originalWords: Array<{word: string; start: number; end: number}>
) => {
  const words = translatedText.split(/\s+/).filter(Boolean);
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
        })) || generateEnhancedWordTimings(segment.text.trim(), segment.start, segment.end, []);
        
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

const formatTimeRange = (startTime: number, endTime: number): string => {
  return `${formatTime(startTime)}-${formatTime(endTime)}`;
};
