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
    
    // Step 1: Use Groq for initial transcription in original language WITHOUT timestamps
    const groq = new Groq({
      apiKey: GROQ_API_KEY,
      dangerouslyAllowBrowser: true,
    });

    console.log('Step 1: Transcribing with Groq Whisper (full text without timestamps)...');
    
    // Get full transcription without timestamps first
    const transcription = await groq.audio.transcriptions.create({
      file: file,
      model: "whisper-large-v3-turbo",
      response_format: "verbose_json",
      // No timestamp granularities for clean text
      temperature: 0.0,
    });

    console.log('✓ Groq transcription completed successfully');
    
    // Step 2: Extract the full text without timestamps
    let fullText = '';
    if (transcription.text) {
      fullText = transcription.text.trim();
    } else if ((transcription as any).segments) {
      fullText = (transcription as any).segments.map((segment: any) => segment.text.trim()).join(' ');
    }
    
    console.log('Full transcription text (without timestamps):', fullText);

    // Step 3: Translate the full text using Gemini
    const targetLanguageName = getLanguageName(language);
    console.log('Step 2: Translating full text to', targetLanguageName);
    
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const translationPrompt = `You are a professional translator. Translate the following text to ${targetLanguageName}.

CRITICAL INSTRUCTIONS:
1. Translate the text accurately to ${targetLanguageName}
2. If the source is already in ${targetLanguageName}, improve clarity and grammar but keep the meaning
3. Maintain the original meaning and context
4. Return ONLY the translated text without any additional comments
5. Preserve the natural flow and tone of speech

Text to translate to ${targetLanguageName}:
"${fullText}"

Translated text in ${targetLanguageName}:`;

    console.log(`🔄 Sending translation request to Gemini...`);
    
    const result = await model.generateContent(translationPrompt);
    const translatedFullText = result.response.text().trim();
    
    console.log('✓ Translation completed');
    console.log('Translated text:', translatedFullText);

    // Step 4: Get the audio duration for timestamp generation
    console.log('Step 3: Getting audio duration for timestamp generation...');
    
    // Get a new transcription just to get the duration
    const durationTranscription = await groq.audio.transcriptions.create({
      file: file,
      model: "whisper-large-v3-turbo",
      response_format: "verbose_json",
      temperature: 0.0,
    });
    
    // Get total duration of the audio
    const totalDuration = (durationTranscription as any).duration || 0;
    console.log('✓ Audio duration:', totalDuration, 'seconds');
    
    // We don't need segments from original transcript anymore
    const groqSegments: TranscriptionLine[] = [];
    console.log('✓ Will generate timestamps for translated text');

    // Step 5: Generate timestamps for the translated text
    console.log('Step 4: Generating timestamps for translated text...');
    
    // Create translated segments with generated timestamps
    const translatedSegments: TranscriptionLine[] = [];
    
    // Split translated text into sentences for natural segmentation
    // Using a regex that matches end of sentences (period, exclamation, question mark followed by space or end of string)
    const sentenceRegex = /([.!?]\s|[.!?]$)/;
    const translatedSentences = translatedFullText.split(sentenceRegex).filter(Boolean);
    
    console.log(`Found ${translatedSentences.length} sentences in translated text`);
    
    // If we have no sentences (unlikely), create a single segment with the full text
    if (translatedSentences.length === 0) {
      translatedSegments.push({
        timestamp: `00:00-${formatTime(totalDuration)}`,
        text: translatedFullText,
        startTime: 0,
        endTime: totalDuration,
        confidence: 100, // Fixed confidence for generated timestamps
      });
    } else {
      // Determine how to split the sentences into segments
      // For short audio (<30s), use fewer segments
      // For longer audio, aim for segments of 5-15 seconds each
      
      const idealSegmentCount = Math.max(
        2,
        Math.min(
          20, // Don't create too many segments
          Math.ceil(totalDuration / 10) // Roughly one segment per 10 seconds
        )
      );
      
      // Calculate how many sentences should go in each segment
      const sentencesPerSegment = Math.max(1, Math.ceil(translatedSentences.length / idealSegmentCount));
      
      console.log(`Creating approximately ${idealSegmentCount} segments with ~${sentencesPerSegment} sentences each`);
      
      // Group sentences into segments
      let currentSegmentText = '';
      let sentenceCount = 0;
      let segmentStartTime = 0;
      
      // Calculate the duration per character to distribute time proportionally
      const durationPerChar = totalDuration / translatedFullText.length;
      
      for (let i = 0; i < translatedSentences.length; i++) {
        const sentence = translatedSentences[i];
        currentSegmentText += sentence;
        sentenceCount++;
        
        const isLastSentence = i === translatedSentences.length - 1;
        
        // End segment if we've reached the target sentence count or it's the last sentence
        if (isLastSentence || sentenceCount >= sentencesPerSegment) {
          // Calculate end time based on text length proportion
          const segmentLength = currentSegmentText.length;
          const segmentDuration = segmentLength * durationPerChar;
          const segmentEndTime = Math.min(segmentStartTime + segmentDuration, totalDuration);
          
          // Create a new segment with generated timestamp
          translatedSegments.push({
            timestamp: `${formatTime(segmentStartTime)}-${formatTime(segmentEndTime)}`,
            text: currentSegmentText.trim(),
            startTime: segmentStartTime,
            endTime: segmentEndTime,
            confidence: 100, // Fixed confidence for generated timestamps
          });
          
          console.log(`Generated Segment ${translatedSegments.length}:`);
          console.log(`  Timestamp: ${formatTime(segmentStartTime)}-${formatTime(segmentEndTime)}`);
          console.log(`  Translated (${targetLanguageName}): "${currentSegmentText.trim()}"`);
          
          // Reset for next segment
          segmentStartTime = segmentEndTime;
          currentSegmentText = '';
          sentenceCount = 0;
        }
      }
    }
    
    // If we somehow ended up with no segments, create a single segment with the full text
    if (translatedSegments.length === 0) {
      translatedSegments.push({
        timestamp: `00:00-${formatTime(totalDuration)}`,
        text: translatedFullText,
        startTime: 0,
        endTime: totalDuration,
        confidence: 100,
      });
    }

    console.log('✓ Created translated segments with timestamps');
    console.log('✓ Final segments count:', translatedSegments.length);
    
    // Step 6: Add word-level timestamps to the translated segments
    console.log('Step 5: Adding word-level timestamps to translated segments...');
    
    // Process each segment to add word-level timestamps
    const finalSegments = translatedSegments.map((segment) => {
      // Split the translated text into words
      const translatedWords = segment.text.split(/\s+/).filter(Boolean);
      
      // Calculate duration per word based on segment duration
      const segmentDuration = segment.endTime - segment.startTime;
      const wordDuration = translatedWords.length > 0 ? segmentDuration / translatedWords.length : 0;
      
      // Generate evenly distributed word-level timestamps
      const words = translatedWords.map((word, wordIndex) => {
        const startTime = segment.startTime + (wordDuration * wordIndex);
        const endTime = Math.min(startTime + wordDuration, segment.endTime);
        
        return {
          word,
          start: startTime,
          end: endTime,
        };
      });
      
      return {
        ...segment,
        words,
      };
    });
    
    console.log('✓ Added word-level timestamps to translated segments');
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
