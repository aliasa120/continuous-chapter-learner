
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
      setSaveTranscripts
    }}>
      {children}
    </SettingsContext.Provider>
  );
};
