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

// Enhanced transcription with direct translation (no summarization)
export const transcribeWithGroqAndGemini = async ({ file, language }: TranscriptionOptions): Promise<TranscriptionLine[]> => {
  try {
    console.log('=== ENHANCED TRANSCRIPTION WITH DIRECT TRANSLATION ===');
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
    
    // Step 2: Use Gemini for DIRECT translation (segment by segment)
    const targetLanguageName = getLanguageName(language);
    console.log('Step 2: Using Gemini for DIRECT translation to', targetLanguageName);
    
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    // Process in batches to maintain accuracy and avoid token limits
    const batchSize = 5;
    const translatedSegments: TranscriptionLine[] = [];
    
    for (let i = 0; i < originalSegments.length; i += batchSize) {
      const batch = originalSegments.slice(i, i + batchSize);
      console.log(`Processing batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(originalSegments.length/batchSize)}`);
      
      // Create segment-by-segment translation prompt
      const segmentPrompt = `You are a professional translator. Your task is to translate each text segment to natural, fluent ${targetLanguageName} while maintaining the EXACT same meaning and length.

CRITICAL RULES:
1. Translate DIRECTLY - do NOT summarize, condense, or shorten the text
2. Maintain the same speaking style and tone
3. Keep the same level of detail
4. If a segment has multiple sentences, translate ALL of them
5. Preserve natural speech patterns and filler words if present
6. Return ONLY the translations in the same order

SEGMENTS TO TRANSLATE:
${batch.map((seg, idx) => `${idx + 1}. "${seg.text}"`).join('\n')}

Translate each segment to ${targetLanguageName} (maintain full length and meaning):
${batch.map((seg, idx) => `${idx + 1}. `).join('\n')}`;

      try {
        const result = await model.generateContent(segmentPrompt);
        const translatedText = result.response.text().trim();
        
        // Parse the numbered translations
        const translations = parseNumberedTranslations(translatedText, batch.length);
        
        // Map translations back to segments with timing
        batch.forEach((originalSegment, batchIndex) => {
          const translation = translations[batchIndex] || originalSegment.text;
          
          // Create enhanced word timings for translated text
          const translatedWords = generateEnhancedWordTimings(
            translation, 
            originalSegment.startTime, 
            originalSegment.endTime,
            originalSegment.words || []
          );
          
          translatedSegments.push({
            timestamp: originalSegment.timestamp,
            text: translation,
            startTime: originalSegment.startTime,
            endTime: originalSegment.endTime,
            confidence: 95, // High confidence for AI translation
            words: translatedWords
          });
        });
        
        console.log(`✓ Batch ${Math.floor(i/batchSize) + 1} completed`);
        
      } catch (batchError) {
        console.error(`Error in batch ${Math.floor(i/batchSize) + 1}:`, batchError);
        // Fallback to original segments for this batch
        batch.forEach(segment => {
          translatedSegments.push({
            ...segment,
            confidence: 85
          });
        });
      }
      
      // Small delay between batches to avoid rate limiting
      if (i + batchSize < originalSegments.length) {
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    }
    
    console.log('✓ Translation completed');
    console.log('Final segments count:', translatedSegments.length);
    console.log('First few translated segments:', translatedSegments.slice(0, 3));
    console.log('=== TRANSCRIPTION PROCESS COMPLETED ===');
    
    return translatedSegments;
  } catch (error) {
    console.error('❌ Transcription error:', error);
    throw new Error('Transcription failed. Please check your connection and try again.');
  }
};

// Parse numbered translations from Gemini response
const parseNumberedTranslations = (text: string, expectedCount: number): string[] => {
  const lines = text.split('\n').filter(line => line.trim());
  const translations: string[] = [];
  
  for (let i = 1; i <= expectedCount; i++) {
    // Look for numbered patterns like "1. text" or "1) text" or just text on the ith line
    const pattern = new RegExp(`^${i}[.)\\s]+(.+)`, 'i');
    const line = lines.find(l => pattern.test(l.trim()));
    
    if (line) {
      const match = line.match(pattern);
      translations.push(match![1].trim());
    } else if (lines[i - 1]) {
      // Fallback: use the ith line directly
      translations.push(lines[i - 1].replace(/^\d+[.)]\s*/, '').trim());
    } else {
      // Last fallback: empty string (will use original)
      translations.push('');
    }
  }
  
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
