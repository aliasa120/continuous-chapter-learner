
import type { TranscriptionLine } from './geminiTranscription';

export type ExportFormat = 'txt' | 'srt' | 'vtt' | 'json' | 'csv';

export const exportFormats = [
  { value: 'txt', label: 'Plain Text (.txt)', description: 'Simple text format' },
  { value: 'srt', label: 'SubRip (.srt)', description: 'Standard subtitle format' },
  { value: 'vtt', label: 'WebVTT (.vtt)', description: 'Web video text tracks' },
  { value: 'json', label: 'JSON (.json)', description: 'Structured data format' },
  { value: 'csv', label: 'CSV (.csv)', description: 'Spreadsheet format' }
];

const formatTime = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  const milliseconds = Math.floor((seconds % 1) * 1000);
  
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')},${milliseconds.toString().padStart(3, '0')}`;
};

const formatTimeVTT = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  const milliseconds = Math.floor((seconds % 1) * 1000);
  
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${milliseconds.toString().padStart(3, '0')}`;
};

export const exportTranscription = (
  transcriptionLines: TranscriptionLine[],
  format: ExportFormat,
  filename: string = 'transcription'
): void => {
  let content = '';
  let mimeType = 'text/plain';
  let extension = '.txt';

  switch (format) {
    case 'txt':
      content = transcriptionLines.map(line => {
        const speaker = line.speaker ? `${line.speaker}: ` : '';
        return `[${line.timestamp}] ${speaker}${line.text}`;
      }).join('\n\n');
      mimeType = 'text/plain';
      extension = '.txt';
      break;

    case 'srt':
      content = transcriptionLines.map((line, index) => {
        const startTime = formatTime(line.startTime);
        const endTime = formatTime(line.endTime);
        const speaker = line.speaker ? `<font color="#ff6b6b">${line.speaker}:</font> ` : '';
        return `${index + 1}\n${startTime} --> ${endTime}\n${speaker}${line.text}\n`;
      }).join('\n');
      mimeType = 'text/plain';
      extension = '.srt';
      break;

    case 'vtt':
      content = 'WEBVTT\n\n' + transcriptionLines.map((line, index) => {
        const startTime = formatTimeVTT(line.startTime);
        const endTime = formatTimeVTT(line.endTime);
        const speaker = line.speaker ? `<v ${line.speaker}>${line.text}</v>` : line.text;
        return `${startTime} --> ${endTime}\n${speaker}\n`;
      }).join('\n');
      mimeType = 'text/vtt';
      extension = '.vtt';
      break;

    case 'json':
      const jsonData = {
        metadata: {
          exportDate: new Date().toISOString(),
          totalSegments: transcriptionLines.length,
          duration: transcriptionLines.length > 0 ? transcriptionLines[transcriptionLines.length - 1].endTime : 0
        },
        transcription: transcriptionLines.map((line, index) => ({
          index: index + 1,
          startTime: line.startTime,
          endTime: line.endTime,
          duration: line.endTime - line.startTime,
          timestamp: line.timestamp,
          speaker: line.speaker || null,
          text: line.text,
          confidence: line.confidence || null
        }))
      };
      content = JSON.stringify(jsonData, null, 2);
      mimeType = 'application/json';
      extension = '.json';
      break;

    case 'csv':
      const csvHeaders = 'Index,Start Time,End Time,Duration,Timestamp,Speaker,Text,Confidence\n';
      const csvRows = transcriptionLines.map((line, index) => {
        const speaker = (line.speaker || '').replace(/"/g, '""');
        const text = line.text.replace(/"/g, '""');
        return `${index + 1},${line.startTime},${line.endTime},${line.endTime - line.startTime},"${line.timestamp}","${speaker}","${text}",${line.confidence || ''}`;
      }).join('\n');
      content = csvHeaders + csvRows;
      mimeType = 'text/csv';
      extension = '.csv';
      break;
  }

  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}${extension}`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
