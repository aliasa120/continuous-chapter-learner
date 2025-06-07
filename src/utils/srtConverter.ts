
import type { TranscriptionLine } from './geminiTranscription';

export const convertToSRT = (transcriptionLines: TranscriptionLine[]): string => {
  return transcriptionLines.map((line, index) => {
    const startTime = formatSRTTime(line.startTime);
    const endTime = formatSRTTime(line.endTime);
    
    return `${index + 1}
${startTime} --> ${endTime}
${line.text}

`;
  }).join('');
};

const formatSRTTime = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  const milliseconds = Math.floor((seconds % 1) * 1000);
  
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')},${milliseconds.toString().padStart(3, '0')}`;
};

export const createSRTBlob = (transcriptionLines: TranscriptionLine[]): string => {
  const srtContent = convertToSRT(transcriptionLines);
  const blob = new Blob([srtContent], { type: 'text/plain' });
  return URL.createObjectURL(blob);
};
