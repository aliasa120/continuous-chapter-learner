
import { useState, useEffect } from 'react';
import type { TranscriptionLine } from '../utils/geminiTranscription';

export interface TranscriptionHistoryItem {
  id: string;
  filename: string;
  timestamp: string;
  duration: number;
  language: string;
  transcriptionLines: TranscriptionLine[];
  createdAt: Date;
}

export const useTranscriptionHistory = () => {
  const [history, setHistory] = useState<TranscriptionHistoryItem[]>([]);

  useEffect(() => {
    const savedHistory = localStorage.getItem('transcription-history');
    if (savedHistory) {
      try {
        const parsed = JSON.parse(savedHistory);
        setHistory(parsed.map((item: any) => ({
          ...item,
          createdAt: new Date(item.createdAt)
        })));
      } catch (error) {
        console.error('Failed to parse transcription history:', error);
      }
    }
  }, []);

  const addToHistory = (item: Omit<TranscriptionHistoryItem, 'id' | 'createdAt'>) => {
    const newItem: TranscriptionHistoryItem = {
      ...item,
      id: crypto.randomUUID(),
      createdAt: new Date()
    };

    const updatedHistory = [newItem, ...history].slice(0, 50); // Keep only last 50 items
    setHistory(updatedHistory);
    localStorage.setItem('transcription-history', JSON.stringify(updatedHistory));
  };

  const removeFromHistory = (id: string) => {
    const updatedHistory = history.filter(item => item.id !== id);
    setHistory(updatedHistory);
    localStorage.setItem('transcription-history', JSON.stringify(updatedHistory));
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem('transcription-history');
  };

  return {
    history,
    addToHistory,
    removeFromHistory,
    clearHistory
  };
};
