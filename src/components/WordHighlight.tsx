
import React from 'react';
import { WordTimestamp } from '../types/transcription';

interface WordHighlightProps {
  words: WordTimestamp[];
  currentTime: number;
  className?: string;
}

const WordHighlight: React.FC<WordHighlightProps> = ({ words, currentTime, className = '' }) => {
  if (!words.length) return null;

  return (
    <span className={className}>
      {words.map((word, index) => {
        const isActive = currentTime >= word.startTime && currentTime <= word.endTime;
        
        return (
          <span
            key={index}
            className={`transition-all duration-200 ${
              isActive 
                ? 'bg-yellow-300 text-black font-semibold shadow-sm px-1 rounded' 
                : ''
            }`}
          >
            {word.word}
            {index < words.length - 1 ? ' ' : ''}
          </span>
        );
      })}
    </span>
  );
};

export default WordHighlight;
