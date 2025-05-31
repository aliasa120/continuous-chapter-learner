
import { GoogleGenerativeAI } from '@google/generative-ai';

export interface TranscriptionLine {
  timestamp: string;
  text: string;
  startTime: number;
  speaker?: string;
}

export interface TranscriptionOptions {
  file: File;
  language: string;
  apiKey: string;
}

export const transcribeWithGemini = async ({ file, language, apiKey }: TranscriptionOptions): Promise<TranscriptionLine[]> => {
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite" });

    // Convert file to base64
    const fileData = await fileToBase64(file);
    
    const prompt = `Please transcribe this audio/video file to text in ${language}. 
    Format your response as follows:
    - Include timestamps in format [MM:SS] or [HH:MM:SS]
    - If multiple speakers are detected, identify them as Speaker 1, Speaker 2, etc.
    - Separate each line with the timestamp followed by the text
    - Be as accurate as possible with timing

    Example format:
    [00:02] Speaker 1: Hello and welcome to this presentation
    [00:08] Speaker 2: Thank you for having me here today
    [00:14] Speaker 1: Let's begin with the introduction`;

    const result = await model.generateContentStream([
      {
        text: prompt
      },
      {
        inlineData: {
          mimeType: file.type,
          data: fileData
        }
      }
    ]);

    let transcriptionText = '';
    for await (const chunk of result.stream) {
      const chunkText = chunk.text();
      transcriptionText += chunkText;
    }

    return parseTranscription(transcriptionText);
  } catch (error) {
    console.error('Transcription error:', error);
    throw new Error('Failed to transcribe audio. Please check your API key and try again.');
  }
};

const parseTranscription = (text: string): TranscriptionLine[] => {
  const lines = text.split('\n').filter(line => line.trim());
  const transcriptionLines: TranscriptionLine[] = [];

  lines.forEach(line => {
    // Match patterns like [00:02] Speaker 1: text or [00:02] text
    const timeMatch = line.match(/\[(\d{1,2}:\d{2}(?::\d{2})?)\]/);
    if (timeMatch) {
      const timeStr = timeMatch[1];
      const restOfLine = line.substring(timeMatch.index! + timeMatch[0].length).trim();
      
      // Check for speaker identification
      const speakerMatch = restOfLine.match(/^(Speaker \d+|speaker \d+):\s*(.*)/i);
      let speaker: string | undefined;
      let text: string;

      if (speakerMatch) {
        speaker = speakerMatch[1];
        text = speakerMatch[2];
      } else {
        text = restOfLine.replace(/^:\s*/, ''); // Remove leading colon if present
      }

      if (text.trim()) {
        transcriptionLines.push({
          timestamp: formatTimestamp(timeStr),
          text: text.trim(),
          startTime: parseTimeToSeconds(timeStr),
          speaker
        });
      }
    }
  });

  return transcriptionLines;
};

const parseTimeToSeconds = (timeStr: string): number => {
  const parts = timeStr.split(':').map(Number);
  if (parts.length === 2) {
    // MM:SS format
    return parts[0] * 60 + parts[1];
  } else if (parts.length === 3) {
    // HH:MM:SS format
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  }
  return 0;
};

const formatTimestamp = (timeStr: string): string => {
  const parts = timeStr.split(':');
  if (parts.length === 2) {
    return `00:${timeStr}`;
  }
  return timeStr;
};

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = error => reject(error);
  });
};
