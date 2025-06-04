
export interface WordTimestamp {
  word: string;
  startTime: number;
  endTime: number;
  confidence?: number;
}

export interface TranscriptionLine {
  text: string;
  timestamp: string;
  startTime: number;
  endTime: number;
  speaker?: string;
  confidence?: number;
  words?: WordTimestamp[];
}

export interface ExplanationData {
  text: string;
  isLoading: boolean;
}

export interface SummaryData {
  text: string;
  isLoading: boolean;
}
