
import React from 'react';
import { useSettings } from '../contexts/SettingsContext';

interface WordHighlightProps {
  text: string;
  currentTime: number;
  startTime: number;
  endTime: number;
  wordsPerSecond?: number;
}

const WordHighlight: React.FC<WordHighlightProps> = ({
  text,
  currentTime,
  startTime,
  endTime,
  wordsPerSecond = 2.5
}) => {
  const { wordHighlightColor, wordHighlightOpacity, wordHighlightAnimation } = useSettings();
  
  const words = text.split(' ');
  const segmentDuration = endTime - startTime;
  const timePerWord = segmentDuration / words.length;
  
  const getColorClass = (color: string) => {
    switch (color) {
      case 'primary': return 'bg-primary text-primary-foreground';
      case 'secondary': return 'bg-secondary text-secondary-foreground';
      case 'accent': return 'bg-accent text-accent-foreground';
      case 'success': return 'bg-green-500 text-white';
      case 'warning': return 'bg-yellow-500 text-black';
      case 'destructive': return 'bg-red-500 text-white';
      default: return 'bg-primary text-primary-foreground';
    }
  };

  const getAnimationClass = (animation: string) => {
    switch (animation) {
      case 'pulse': return 'animate-pulse';
      case 'glow': return 'animate-pulse shadow-lg';
      case 'bounce': return 'animate-bounce';
      case 'fade': return 'animate-fade-in';
      case 'scale': return 'transform scale-110 transition-transform duration-200';
      default: return '';
    }
  };
  
  const getWordHighlight = (wordIndex: number) => {
    const wordStartTime = startTime + (wordIndex * timePerWord);
    const wordEndTime = wordStartTime + timePerWord;
    
    // Current word being spoken
    if (currentTime >= wordStartTime && currentTime <= wordEndTime) {
      const colorClass = getColorClass(wordHighlightColor);
      const animationClass = getAnimationClass(wordHighlightAnimation);
      return `${colorClass} font-bold px-2 py-1 rounded-md shadow-sm transform transition-all duration-200 ${animationClass}`;
    }
    
    // Already spoken words
    if (currentTime > wordEndTime) {
      const bgOpacity = Math.floor(wordHighlightOpacity / 2);
      return `text-${wordHighlightColor}/80 font-medium bg-${wordHighlightColor}/${bgOpacity} px-1 py-0.5 rounded transition-all duration-300`;
    }
    
    // Not yet spoken words
    return 'text-muted-foreground hover:text-foreground transition-colors duration-200';
  };

  const getWordProgress = (wordIndex: number) => {
    const wordStartTime = startTime + (wordIndex * timePerWord);
    const wordEndTime = wordStartTime + timePerWord;
    
    if (currentTime >= wordStartTime && currentTime <= wordEndTime) {
      return ((currentTime - wordStartTime) / timePerWord) * 100;
    }
    
    return currentTime > wordEndTime ? 100 : 0;
  };

  return (
    <div className="leading-relaxed text-sm sm:text-base">
      {words.map((word, index) => {
        const progress = getWordProgress(index);
        const isActive = currentTime >= startTime + (index * timePerWord) && 
                        currentTime <= startTime + ((index + 1) * timePerWord);
        
        return (
          <span
            key={index}
            className={`relative inline-block transition-all duration-300 ease-in-out mr-1 ${getWordHighlight(index)}`}
            style={{
              transitionDelay: `${index * 50}ms`
            }}
          >
            {word}
            {isActive && wordHighlightAnimation !== 'none' && (
              <div 
                className={`absolute bottom-0 left-0 h-0.5 bg-${wordHighlightColor} transition-all duration-100`}
                style={{ width: `${progress}%` }}
              />
            )}
          </span>
        );
      })}
    </div>
  );
};

export default WordHighlight;
