
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
      return 'bg-yellow-300 text-black font-semibold px-1 rounded';
    }
    
    if (currentTime > wordEndTime) {
      return 'text-green-700 font-medium';
    }
    
    return 'text-gray-700';
  };

  return (
    <div className="leading-relaxed">
      {words.map((word, index) => (
        <span
          key={index}
          className={`transition-all duration-200 ${getWordHighlight(index)}`}
        >
          {word}
          {index < words.length - 1 ? ' ' : ''}
        </span>
      ))}
    </div>
  );
};

export default WordHighlight;
