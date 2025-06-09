
import { useState, useEffect } from 'react';
import type { TranscriptionLine } from '../utils/geminiTranscription';

export interface ActionItem {
  text: string;
  timestamp: string;
  speaker?: string;
  index: number;
}

export interface TranscriptionHistoryItem {
  id: string;
  filename: string;
  timestamp: string;
  duration: number;
  language: string;
  transcriptionLines: TranscriptionLine[];
  createdAt: Date;
  actions?: ActionItem[];
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

    const updatedHistory = [newItem, ...history].slice(0, 50);
    setHistory(updatedHistory);
    localStorage.setItem('transcription-history', JSON.stringify(updatedHistory));
  };

  const updateHistoryActions = (id: string, actions: ActionItem[]) => {
    const updatedHistory = history.map(item => 
      item.id === id ? { ...item, actions } : item
    );
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
    updateHistoryActions,
    removeFromHistory,
    clearHistory
  };
};
