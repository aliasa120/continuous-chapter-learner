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

// Mobile-optimized transcription with Gemini handling translation + timestamps
export const transcribeWithGroqAndGemini = async ({ file, language }: TranscriptionOptions): Promise<TranscriptionLine[]> => {
  try {
    console.log('=== MOBILE-OPTIMIZED TRANSCRIPTION PROCESS ===');
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
    const fullOriginalText = originalSegments.map(seg => seg.text).join(' ');
    const totalDuration = Math.max(...originalSegments.map(seg => seg.endTime));
    
    console.log('Original text length:', fullOriginalText.length);
    console.log('Total segments:', originalSegments.length);
    
    // Step 2: Use Gemini to translate AND generate structured timestamps in one call
    const targetLanguageName = getLanguageName(language);
    console.log('Step 2: Using Gemini for translation + timestamp generation...');
    
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    // Enhanced prompt for Gemini to handle both translation and timestamp structuring
    const enhancedPrompt = `You are a professional translator and transcription specialist. Your task is to translate the given text segments and maintain their timing structure.

ORIGINAL LANGUAGE TEXT WITH TIMESTAMPS:
${originalSegments.map(seg => `[${seg.timestamp}] ${seg.text}`).join('\n')}

TRANSLATION REQUIREMENTS:
1. Translate each segment to natural, fluent ${targetLanguageName}
2. Maintain the timing structure but adjust for natural speech flow in ${targetLanguageName}
3. Keep the same number of segments unless natural breaking points require adjustment
4. Preserve word-level timing proportions within each segment
5. If the source is already in ${targetLanguageName}, improve clarity and grammar

RESPONSE FORMAT:
Provide ONLY a JSON array with this exact structure:
[
  {
    "timestamp": "MM:SS-MM:SS",
    "text": "translated text in ${targetLanguageName}",
    "startTime": seconds_number,
    "endTime": seconds_number,
    "words": [
      {"word": "word1", "start": start_time, "end": end_time},
      {"word": "word2", "start": start_time, "end": end_time}
    ]
  }
]

Total duration should remain: ${totalDuration.toFixed(2)} seconds
Target language: ${targetLanguageName}

Translated segments:`;

    console.log('🔄 Sending enhanced translation request to Gemini...');
    
    const result = await model.generateContent(enhancedPrompt);
    let responseText = result.response.text().trim();
    
    // Clean up response to extract JSON
    if (responseText.includes('```json')) {
      responseText = responseText.split('```json')[1].split('```')[0].trim();
    } else if (responseText.includes('```')) {
      responseText = responseText.split('```')[1].trim();
    }
    
    console.log('Raw Gemini response length:', responseText.length);
    
    let translatedSegments: TranscriptionLine[] = [];
    
    try {
      // Try to parse Gemini's structured response
      const parsedResponse = JSON.parse(responseText);
      
      if (Array.isArray(parsedResponse)) {
        translatedSegments = parsedResponse.map((seg, index) => ({
          timestamp: seg.timestamp || formatTimeRange(seg.startTime || 0, seg.endTime || 0),
          text: seg.text || '',
          startTime: seg.startTime || 0,
          endTime: seg.endTime || 0,
          confidence: 95, // High confidence for AI translation
          words: seg.words || generateWordTimings(seg.text || '', seg.startTime || 0, seg.endTime || 0)
        }));
        
        console.log('✓ Successfully parsed Gemini structured response');
      }
    } catch (parseError) {
      console.log('Gemini response parsing failed, using fallback method...');
      // Fallback: Use simple translation and map to original structure
      translatedSegments = await translateAndMapToOriginalStructure(responseText, originalSegments, targetLanguageName);
    }
    
    // Validate and ensure we have proper segments
    if (translatedSegments.length === 0) {
      console.log('Using fallback: mapping original structure...');
      translatedSegments = originalSegments.map(seg => ({
        ...seg,
        text: seg.text, // Keep original if translation failed
        confidence: 85
      }));
    }
    
    console.log('✓ Final segments count:', translatedSegments.length);
    console.log('=== TRANSCRIPTION PROCESS COMPLETED ===');
    
    return translatedSegments;
  } catch (error) {
    console.error('❌ Transcription error:', error);
    throw new Error('Transcription failed. Please check your connection and try again.');
  }
};

// Mobile device detection
const isMobileDevice = (): boolean => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
         window.innerWidth <= 768;
};

// File optimization for mobile
const optimizeFileForMobile = async (file: File): Promise<File> => {
  return new Promise((resolve) => {
    // For now, return original file but in future could implement compression
    console.log('File optimization placeholder - returning original file');
    resolve(file);
  });
};

// Fallback translation and mapping
const translateAndMapToOriginalStructure = async (
  translatedText: string, 
  originalSegments: TranscriptionLine[], 
  targetLanguageName: string
): Promise<TranscriptionLine[]> => {
  // Simple approach: split translated text proportionally across original segments
  const sentences = translatedText.split(/[.!?]+/).filter(Boolean);
  
  if (sentences.length === 0) {
    return originalSegments; // Return original if translation is empty
  }
  
  const segmentsPerSentence = Math.max(1, Math.floor(originalSegments.length / sentences.length));
  const translatedSegments: TranscriptionLine[] = [];
  
  let sentenceIndex = 0;
  let segmentIndex = 0;
  
  for (const sentence of sentences) {
    const endSegmentIndex = Math.min(segmentIndex + segmentsPerSentence, originalSegments.length);
    const segmentGroup = originalSegments.slice(segmentIndex, endSegmentIndex);
    
    if (segmentGroup.length > 0) {
      const startTime = segmentGroup[0].startTime;
      const endTime = segmentGroup[segmentGroup.length - 1].endTime;
      
      translatedSegments.push({
        timestamp: formatTimeRange(startTime, endTime),
        text: sentence.trim(),
        startTime,
        endTime,
        confidence: 90,
        words: generateWordTimings(sentence.trim(), startTime, endTime)
      });
    }
    
    segmentIndex = endSegmentIndex;
    sentenceIndex++;
  }
  
  return translatedSegments;
};

// Enhanced word timing generation for stronger sync
const generateWordTimings = (text: string, startTime: number, endTime: number) => {
  const words = text.split(/\s+/).filter(Boolean);
  const duration = endTime - startTime;
  const avgWordDuration = words.length > 0 ? duration / words.length : 0;
  
  return words.map((word, index) => {
    const wordStart = startTime + (avgWordDuration * index);
    const wordEnd = Math.min(wordStart + avgWordDuration, endTime);
    
    return {
      word: word.replace(/[.,!?;:]$/, ''), // Clean punctuation
      start: wordStart,
      end: wordEnd,
    };
  });
};

// ... keep existing code (parseGroqTranscription, getLanguageName, formatTime, formatTimeRange functions)

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
        })) || generateWordTimings(segment.text.trim(), segment.start, segment.end);
        
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
