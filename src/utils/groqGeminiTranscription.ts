
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
    console.log('=== STARTING COMPREHENSIVE TRANSCRIPTION PROCESS ===');
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

    console.log('✓ Groq transcription completed successfully');
    console.log('Original transcription language detected:', transcription.language);

    // Step 2: Parse Groq response and extract segments with word-level timestamps
    const groqSegments = parseGroqTranscription(transcription);
    console.log('✓ Parsed segments count:', groqSegments.length);

    // Step 3: Check if translation is needed
    const originalLanguage = transcription.language || 'unknown';
    const targetLanguageName = getLanguageName(language);
    
    console.log('Original language detected:', originalLanguage);
    console.log('Target language requested:', targetLanguageName);

    // If target language is the same as original, return as-is
    if (language === 'en' && originalLanguage === 'english') {
      console.log('✓ No translation needed - both languages are English');
      return groqSegments;
    }

    // Step 4: Translate using Gemini with improved strategy
    console.log('Step 2: Starting translation process...');
    
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    // Create comprehensive translation prompt
    const segmentTexts = groqSegments.map((segment, index) => 
      `[${index + 1}] ${segment.text.trim()}`
    ).join('\n');

    const translationPrompt = `You are a professional translator. Your task is to translate the following transcription segments from ${originalLanguage} to ${targetLanguageName}.

CRITICAL INSTRUCTIONS:
1. Translate each numbered segment accurately to ${targetLanguageName}
2. Maintain the original meaning and context
3. Return ONLY the translated text for each segment
4. Keep the same numbering format: [1] translated text, [2] translated text, etc.
5. Do not add explanations, notes, or commentary
6. Preserve the natural flow and tone of speech

Original transcription segments to translate:
${segmentTexts}

Translate all segments to ${targetLanguageName}:`;

    console.log('🔄 Sending translation request to Gemini...');
    console.log('Translation prompt preview:', translationPrompt.substring(0, 200) + '...');
    
    const result = await model.generateContent(translationPrompt);
    const translatedResponse = result.response.text().trim();
    
    console.log('✓ Gemini translation completed');
    console.log('Translation response preview:', translatedResponse.substring(0, 200) + '...');

    // Parse translation response with improved error handling
    const translatedLines = translatedResponse
      .split('\n')
      .filter(line => line.trim())
      .map(line => {
        // Remove numbering like [1], [2], etc.
        return line.replace(/^\[\d+\]\s*/, '').trim();
      });
    
    console.log('✓ Parsed translated lines count:', translatedLines.length);
    console.log('✓ Original segments count:', groqSegments.length);

    // Verify translation count matches original
    if (translatedLines.length !== groqSegments.length) {
      console.warn('⚠️ Translation count mismatch. Using fallback strategy...');
      // Fallback: pad with original text if needed
      while (translatedLines.length < groqSegments.length) {
        const missingIndex = translatedLines.length;
        translatedLines.push(groqSegments[missingIndex]?.text || '');
      }
    }

    // Map translations back to segments with verification
    const finalSegments = groqSegments.map((segment, index) => {
      const translatedText = translatedLines[index]?.trim() || segment.text;
      
      console.log(`Segment ${index + 1}:`);
      console.log(`  Original (${originalLanguage}): "${segment.text}"`);
      console.log(`  Translated (${targetLanguageName}): "${translatedText}"`);
      
      return {
        ...segment,
        text: translatedText,
      };
    });

    console.log('✓ Translation mapping complete');
    console.log('✓ Final segments count:', finalSegments.length);
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
