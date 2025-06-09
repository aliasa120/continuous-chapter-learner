import React, { createContext, useContext, useEffect, useState } from 'react';

interface SettingsContextType {
  autoPlay: boolean;
  setAutoPlay: (value: boolean) => void;
  autoScroll: boolean;
  setAutoScroll: (value: boolean) => void;
  showConfidence: boolean;
  setShowConfidence: (value: boolean) => void;
  defaultLanguage: string;
  setDefaultLanguage: (value: string) => void;
  notifications: boolean;
  setNotifications: (value: boolean) => void;
  saveTranscripts: boolean;
  setSaveTranscripts: (value: boolean) => void;
  wordHighlightColor: string;
  setWordHighlightColor: (value: string) => void;
  wordHighlightOpacity: number;
  setWordHighlightOpacity: (value: number) => void;
  wordHighlightAnimation: string;
  setWordHighlightAnimation: (value: string) => void;
  timestampPlayerMode: string;
  setTimestampPlayerMode: (value: string) => void;
  defaultExportFormat: string;
  setDefaultExportFormat: (value: string) => void;
  showExportDialog: boolean;
  setShowExportDialog: (value: boolean) => void;
  maxFileSize: number;
  setMaxFileSize: (value: number) => void;
  maxDuration: number;
  setMaxDuration: (value: number) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [autoPlay, setAutoPlay] = useState(() => {
    const saved = localStorage.getItem('autoPlay');
    return saved ? JSON.parse(saved) : false;
  });

  const [autoScroll, setAutoScroll] = useState(() => {
    const saved = localStorage.getItem('autoScroll');
    return saved ? JSON.parse(saved) : true;
  });

  const [showConfidence, setShowConfidence] = useState(() => {
    const saved = localStorage.getItem('showConfidence');
    return saved ? JSON.parse(saved) : true;
  });

  const [defaultLanguage, setDefaultLanguage] = useState(() => {
    const saved = localStorage.getItem('defaultLanguage');
    return saved || 'en';
  });

  const [notifications, setNotifications] = useState(() => {
    const saved = localStorage.getItem('notifications');
    return saved ? JSON.parse(saved) : true;
  });

  const [saveTranscripts, setSaveTranscripts] = useState(() => {
    const saved = localStorage.getItem('saveTranscripts');
    return saved ? JSON.parse(saved) : true;
  });

  const [wordHighlightColor, setWordHighlightColor] = useState(() => {
    const saved = localStorage.getItem('wordHighlightColor');
    return saved || 'primary';
  });

  const [wordHighlightOpacity, setWordHighlightOpacity] = useState(() => {
    const saved = localStorage.getItem('wordHighlightOpacity');
    return saved ? parseInt(saved) : 80;
  });

  const [wordHighlightAnimation, setWordHighlightAnimation] = useState(() => {
    const saved = localStorage.getItem('wordHighlightAnimation');
    return saved || 'pulse';
  });

  const [timestampPlayerMode, setTimestampPlayerMode] = useState(() => {
    const saved = localStorage.getItem('timestampPlayerMode');
    return saved || 'segment';
  });

  const [defaultExportFormat, setDefaultExportFormat] = useState(() => {
    const saved = localStorage.getItem('defaultExportFormat');
    return saved || 'txt';
  });

  const [showExportDialog, setShowExportDialog] = useState(() => {
    const saved = localStorage.getItem('showExportDialog');
    return saved ? JSON.parse(saved) : true;
  });

  const [maxFileSize, setMaxFileSize] = useState(() => {
    const saved = localStorage.getItem('maxFileSize');
    return saved ? parseInt(saved) : 2048; // 2GB in MB
  });

  const [maxDuration, setMaxDuration] = useState(() => {
    const saved = localStorage.getItem('maxDuration');
    return saved ? parseInt(saved) : 3600; // 1 hour in seconds
  });

  // Save settings to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('autoPlay', JSON.stringify(autoPlay));
  }, [autoPlay]);

  useEffect(() => {
    localStorage.setItem('autoScroll', JSON.stringify(autoScroll));
  }, [autoScroll]);

  useEffect(() => {
    localStorage.setItem('showConfidence', JSON.stringify(showConfidence));
  }, [showConfidence]);

  useEffect(() => {
    localStorage.setItem('defaultLanguage', defaultLanguage);
  }, [defaultLanguage]);

  useEffect(() => {
    localStorage.setItem('notifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem('saveTranscripts', JSON.stringify(saveTranscripts));
  }, [saveTranscripts]);

  useEffect(() => {
    localStorage.setItem('wordHighlightColor', wordHighlightColor);
  }, [wordHighlightColor]);

  useEffect(() => {
    localStorage.setItem('wordHighlightOpacity', wordHighlightOpacity.toString());
  }, [wordHighlightOpacity]);

  useEffect(() => {
    localStorage.setItem('wordHighlightAnimation', wordHighlightAnimation);
  }, [wordHighlightAnimation]);

  useEffect(() => {
    localStorage.setItem('timestampPlayerMode', timestampPlayerMode);
  }, [timestampPlayerMode]);

  useEffect(() => {
    localStorage.setItem('defaultExportFormat', defaultExportFormat);
  }, [defaultExportFormat]);

  useEffect(() => {
    localStorage.setItem('showExportDialog', JSON.stringify(showExportDialog));
  }, [showExportDialog]);

  useEffect(() => {
    localStorage.setItem('maxFileSize', maxFileSize.toString());
  }, [maxFileSize]);

  useEffect(() => {
    localStorage.setItem('maxDuration', maxDuration.toString());
  }, [maxDuration]);

  return (
    <SettingsContext.Provider value={{
      autoPlay,
      setAutoPlay,
      autoScroll,
      setAutoScroll,
      showConfidence,
      setShowConfidence,
      defaultLanguage,
      setDefaultLanguage,
      notifications,
      setNotifications,
      saveTranscripts,
      setSaveTranscripts,
      wordHighlightColor,
      setWordHighlightColor,
      wordHighlightOpacity,
      setWordHighlightOpacity,
      wordHighlightAnimation,
      setWordHighlightAnimation,
      timestampPlayerMode,
      setTimestampPlayerMode,
      defaultExportFormat,
      setDefaultExportFormat,
      showExportDialog,
      setShowExportDialog,
      maxFileSize,
      setMaxFileSize,
      maxDuration,
      setMaxDuration
    }}>
      {children}
    </SettingsContext.Provider>
  );
};
