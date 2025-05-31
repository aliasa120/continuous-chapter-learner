
import { GoogleGenAI } from '@google/genai';

export interface TranscriptionOptions {
  file: File;
  language: string;
  apiKey: string;
}

export const transcribeWithGemini = async ({ file, language, apiKey }: TranscriptionOptions): Promise<string> => {
  const ai = new GoogleGenAI({
    apiKey: apiKey,
  });

  const config = {
    responseMimeType: 'text/plain',
  };

  const model = 'gemini-2.0-flash-lite';

  // Convert file to base64
  const fileData = await fileToBase64(file);
  
  const contents = [
    {
      role: 'user',
      parts: [
        {
          text: `Please transcribe this audio/video file to text in ${language}. Provide timestamps in the format [HH:MM:SS] followed by the spoken text.`,
        },
        {
          inlineData: {
            mimeType: file.type,
            data: fileData
          }
        }
      ],
    },
  ];

  const response = await ai.models.generateContentStream({
    model,
    config,
    contents,
  });

  let transcriptionText = '';
  for await (const chunk of response) {
    if (chunk.text) {
      transcriptionText += chunk.text;
    }
  }

  return transcriptionText;
};

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      // Remove the data:audio/mp3;base64, prefix
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = error => reject(error);
  });
};

export const parseTranscriptionToLines = (transcriptionText: string) => {
  const lines = transcriptionText.split('\n').filter(line => line.trim());
  const transcriptionLines = [];

  for (const line of lines) {
    // Look for timestamp pattern [HH:MM:SS] or [MM:SS]
    const timestampMatch = line.match(/\[(\d{1,2}:)?(\d{1,2}):(\d{2})\]/);
    
    if (timestampMatch) {
      const hours = timestampMatch[1] ? parseInt(timestampMatch[1].replace(':', '')) : 0;
      const minutes = parseInt(timestampMatch[2]);
      const seconds = parseInt(timestampMatch[3]);
      
      const startTime = hours * 3600 + minutes * 60 + seconds;
      const timestamp = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
      const text = line.replace(timestampMatch[0], '').trim();
      
      if (text) {
        transcriptionLines.push({
          timestamp,
          text,
          startTime
        });
      }
    }
  }

  return transcriptionLines;
};
