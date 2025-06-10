
import React, { createContext, useContext, useState, ReactNode } from 'react';
import type { TranscriptionLine } from '../utils/geminiTranscription';
import type { ActionItem } from '../hooks/useTranscriptionHistory';

interface TranscriptContextType {
  currentTranscript: TranscriptionLine[];
  setCurrentTranscript: (lines: TranscriptionLine[]) => void;
  currentActions: ActionItem[];
  setCurrentActions: (actions: ActionItem[]) => void;
  currentFile: File | null;
  setCurrentFile: (file: File | null) => void;
  currentLanguage: string;
  setCurrentLanguage: (language: string) => void;
  clearTranscript: () => void;
  loadFromHistory: (historyItem: {
    transcriptionLines: TranscriptionLine[];
    actions?: ActionItem[];
    language: string;
  }) => void;
}

const TranscriptContext = createContext<TranscriptContextType | undefined>(undefined);

export const useTranscript = () => {
  const context = useContext(TranscriptContext);
  if (!context) {
    throw new Error('useTranscript must be used within a TranscriptProvider');
  }
  return context;
};

export const TranscriptProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentTranscript, setCurrentTranscript] = useState<TranscriptionLine[]>([]);
  const [currentActions, setCurrentActions] = useState<ActionItem[]>([]);
  const [currentFile, setCurrentFile] = useState<File | null>(null);
  const [currentLanguage, setCurrentLanguage] = useState('en');

  const clearTranscript = () => {
    setCurrentTranscript([]);
    setCurrentActions([]);
    setCurrentFile(null);
  };

  const loadFromHistory = (historyItem: {
    transcriptionLines: TranscriptionLine[];
    actions?: ActionItem[];
    language: string;
  }) => {
    setCurrentTranscript(historyItem.transcriptionLines);
    setCurrentActions(historyItem.actions || []);
    setCurrentLanguage(historyItem.language);
    setCurrentFile(null); // No file since it's from history
  };

  return (
    <TranscriptContext.Provider
      value={{
        currentTranscript,
        setCurrentTranscript,
        currentActions,
        setCurrentActions,
        currentFile,
        setCurrentFile,
        currentLanguage,
        setCurrentLanguage,
        clearTranscript,
        loadFromHistory,
      }}
    >
      {children}
    </TranscriptContext.Provider>
  );
};
