
import React from 'react';

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
  const words = text.split(' ');
  const segmentDuration = endTime - startTime;
  const timePerWord = segmentDuration / words.length;
  
  const getWordHighlight = (wordIndex: number) => {
    const wordStartTime = startTime + (wordIndex * timePerWord);
    const wordEndTime = wordStartTime + timePerWord;
    
    if (currentTime >= wordStartTime && currentTime <= wordEndTime) {
      return 'bg-primary text-primary-foreground font-semibold px-1 py-0.5 rounded-md shadow-sm transform scale-105 transition-all duration-200';
    }
    
    if (currentTime > wordEndTime) {
      return 'text-primary/80 font-medium';
    }
    
    return 'text-muted-foreground hover:text-foreground transition-colors duration-200';
  };

  return (
    <div className="leading-relaxed text-sm sm:text-base">
      {words.map((word, index) => (
        <span
          key={index}
          className={`inline-block transition-all duration-300 ease-in-out mr-1 ${getWordHighlight(index)}`}
        >
          {word}
        </span>
      ))}
    </div>
  );
};

export default WordHighlight;
