import React from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Clipboard, ClipboardCheck, Play, Pause, Clock } from 'lucide-react';
import type { TranscriptionLine } from '../utils/groqGeminiTranscription';
import AIActionButtons from './AIActionButtons';

interface TranscriptionResultProps {
  transcriptionLines: TranscriptionLine[];
  isTranscribing: boolean;
  currentTime: number;
  seekToTimestamp: (seconds: number) => void;
  isPlaying: boolean;
  onPlayPause: () => void;
  showTimestamps?: boolean;
  language?: string;
}

const TranscriptionResult: React.FC<TranscriptionResultProps> = ({
  transcriptionLines,
  isTranscribing,
  currentTime,
  seekToTimestamp,
  isPlaying,
  onPlayPause,
  showTimestamps = true,
  language = 'en'
}) => {
  const [copied, setCopied] = React.useState(false);
  const [expandedCards, setExpandedCards] = React.useState<Set<number>>(new Set());
  const [expandedEssay, setExpandedEssay] = React.useState(false);
  const activeLineRef = React.useRef<HTMLDivElement>(null);

  const copyToClipboard = () => {
    const fullText = showTimestamps
      ? transcriptionLines
          .map(line => `${line.timestamp}: ${line.text}`)
          .join('\n')
      : transcriptionLines
          .map(line => line.text)
          .join(' ');
    
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isLineActive = (line: TranscriptionLine) => {
    return currentTime >= line.startTime && currentTime <= line.endTime;
  };

  const isWordActive = (word: { start: number; end: number }) => {
    return currentTime >= word.start && currentTime <= word.end;
  };

  const getConfidenceIndicator = (confidence?: number) => {
    if (!confidence) return <span className="w-2 h-2 rounded-full bg-gray-400" title="Unknown"></span>;
    if (confidence >= 90) return <span className="w-2 h-2 rounded-full bg-green-500" title="Excellent"></span>;
    if (confidence >= 75) return <span className="w-2 h-2 rounded-full bg-yellow-500" title="Good"></span>;
    if (confidence >= 60) return <span className="w-2 h-2 rounded-full bg-orange-500" title="Moderate"></span>;
    return <span className="w-2 h-2 rounded-full bg-red-500" title="Poor"></span>;
  };

  const toggleCardExpansion = (index: number) => {
    const newExpanded = new Set(expandedCards);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedCards(newExpanded);
  };

  // Enhanced auto-scroll with improved synchronization
  React.useEffect(() => {
    if (activeLineRef.current && isPlaying) {
      const element = activeLineRef.current;
      const container = element.closest('[data-radix-scroll-area-viewport]');
      
      if (container) {
        const containerRect = container.getBoundingClientRect();
        const elementRect = element.getBoundingClientRect();
        
        if (elementRect.top < containerRect.top || elementRect.bottom > containerRect.bottom) {
          element.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
            inline: 'nearest'
          });
        }
      }
    }
  }, [currentTime, isPlaying]);

  if (isTranscribing) {
    return (
      <div className="p-3 sm:p-6 h-60 sm:h-96">
        <div className="flex justify-center items-center h-full">
          <div className="text-center">
            <div className="w-8 h-8 sm:w-16 sm:h-16 mx-auto border-4 rounded-full border-l-green-600 border-r-green-300 border-b-green-600 border-t-green-300 animate-spin mb-4"></div>
            <p className="text-gray-900 animate-pulse text-sm font-semibold">AI Processing...</p>
            <p className="text-xs text-gray-600 mt-2 hidden sm:block">Word-level sync • Precise timing</p>
          </div>
        </div>
      </div>
    );
  }

  if (transcriptionLines.length === 0) {
    return (
      <div className="p-3 sm:p-6 h-60 sm:h-96 flex items-center justify-center text-center">
        <div className="text-gray-600">
          <div className="text-2xl sm:text-4xl mb-4">🎯</div>
          <p className="mb-2 text-sm font-medium">Transcription results will appear here</p>
          <p className="text-xs">Upload a file and start transcription</p>
        </div>
      </div>
    );
  }

  // Essay view (without timestamps)
  if (!showTimestamps) {
    const fullText = transcriptionLines.map(line => line.text).join(' ');
    
    return (
      <div className="flex flex-col h-60 sm:h-96">
        {/* Controls Bar for Essay View */}
        <div className="flex justify-between items-center px-3 sm:px-6 py-2 sm:py-3 border-b border-gray-200 bg-gradient-to-r from-green-50 to-emerald-50">
          <Button
            variant="outline"
            size="sm"
            className="text-sm flex items-center gap-2 text-white bg-green-600 hover:bg-green-700 border-green-600 h-8 sm:h-9 px-3 sm:px-4 font-medium"
            onClick={onPlayPause}
          >
            {isPlaying ? <Pause className="h-3 w-3 sm:h-4 sm:w-4" /> : <Play className="h-3 w-3 sm:h-4 sm:w-4" />}
            <span className="hidden sm:inline">{isPlaying ? "Pause" : "Play"}</span>
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            className="text-xs flex items-center gap-1 text-green-700 hover:bg-green-50 border-green-200 h-7 sm:h-8"
            onClick={copyToClipboard}
          >
            {copied ? <ClipboardCheck className="h-3 w-3" /> : <Clipboard className="h-3 w-3" />}
            <span className="hidden sm:inline">{copied ? "Copied" : "Copy"}</span>
          </Button>
        </div>
        
        {/* Essay Text View with AI Actions */}
        <ScrollArea className="flex-1 p-3 sm:p-4">
          <div className="space-y-4">
            <div className="prose prose-sm sm:prose max-w-none">
              <p className="text-sm sm:text-base leading-relaxed text-gray-900">
                {transcriptionLines.map((line, index) => (
                  <span
                    key={index}
                    className={`transition-all duration-200 ${
                      currentTime >= line.startTime && currentTime <= line.endTime
                        ? 'bg-yellow-200 font-medium px-1 rounded'
                        : ''
                    }`}
                    onClick={() => seekToTimestamp(line.startTime)}
                    style={{ cursor: 'pointer' }}
                  >
                    {line.text}{index < transcriptionLines.length - 1 ? ' ' : ''}
                  </span>
                ))}
              </p>
            </div>
            
            {/* AI Actions for Essay View */}
            <div className="border-t pt-4">
              <AIActionButtons
                text={fullText}
                language={language}
                onExpand={() => setExpandedEssay(!expandedEssay)}
                isExpanded={expandedEssay}
                className="max-w-md"
              />
            </div>
          </div>
        </ScrollArea>
      </div>
    );
  }

  // Timestamp view (original format with AI actions)
  return (
    <div className="flex flex-col h-60 sm:h-96">
      {/* Enhanced Controls Bar */}
      <div className="flex justify-between items-center px-3 sm:px-6 py-2 sm:py-3 border-b border-gray-200 bg-gradient-to-r from-green-50 to-emerald-50">
        <div className="flex items-center gap-2 sm:gap-3">
          <Button
            variant="outline"
            size="sm"
            className="text-sm flex items-center gap-2 text-white bg-green-600 hover:bg-green-700 border-green-600 h-8 sm:h-9 px-3 sm:px-4 font-medium"
            onClick={onPlayPause}
          >
            {isPlaying ? <Pause className="h-3 w-3 sm:h-4 sm:w-4" /> : <Play className="h-3 w-3 sm:h-4 sm:w-4" />}
            <span className="hidden sm:inline">{isPlaying ? "Pause" : "Play"}</span>
          </Button>
        </div>
        
        <div className="text-xs text-gray-500 hidden sm:block font-medium">
          {transcriptionLines.length} segments
        </div>
        
        <Button
          variant="outline"
          size="sm"
          className="text-xs flex items-center gap-1 text-green-700 hover:bg-green-50 border-green-200 h-7 sm:h-8"
          onClick={copyToClipboard}
        >
          {copied ? <ClipboardCheck className="h-3 w-3" /> : <Clipboard className="h-3 w-3" />}
          <span className="hidden sm:inline">{copied ? "Copied" : "Copy"}</span>
        </Button>
      </div>
      
      {/* Enhanced Transcription Lines with AI Actions */}
      <ScrollArea className="flex-1 p-2 sm:p-3">
        <div className="space-y-2 sm:space-y-3">
          {transcriptionLines.map((line, index) => {
            const isActive = currentTime >= line.startTime && currentTime <= line.endTime;
            const isExpanded = expandedCards.has(index);
            
            return (
              <div 
                key={index}
                ref={isActive ? activeLineRef : null}
                className={`rounded-lg border transition-all duration-300 cursor-pointer relative ${
                  isActive 
                    ? 'border-green-500 shadow-lg bg-green-50 ring-2 ring-green-200 transform scale-[1.02] z-10' 
                    : 'border-gray-200 hover:border-green-300 bg-white hover:shadow-sm'
                } ${isExpanded ? 'p-4 sm:p-6' : 'p-3 sm:p-4'}`}
                onClick={() => seekToTimestamp(line.startTime)}
              >
                {/* Individual Play Button */}
                <Button 
                  variant="outline" 
                  size="sm" 
                  className={`absolute top-2 right-2 h-6 w-6 sm:h-8 sm:w-8 p-0 rounded-full transition-all ${
                    isActive 
                      ? 'text-green-800 border-green-600 bg-green-200' 
                      : 'hover:text-green-700 text-gray-500 border-gray-300'
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    seekToTimestamp(line.startTime);
                  }}
                >
                  <Play className="h-2 w-2 sm:h-3 sm:w-3" />
                </Button>

                <div className="flex flex-col pr-8 sm:pr-10">
                  {/* Header Row */}
                  <div className="flex items-center justify-between mb-2 sm:mb-3">
                    <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
                      <span className={`text-xs font-mono px-1.5 sm:px-2 py-0.5 sm:py-1 rounded flex items-center gap-1 ${
                        isActive ? 'text-green-800 bg-green-200' : 'text-green-700 bg-green-100'
                      }`}>
                        <Clock className="h-2 w-2 sm:h-3 sm:w-3" />
                        {line.timestamp}
                      </span>
                      {line.confidence && (
                        <div className={`flex items-center gap-1 text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded ${
                          isActive ? 'bg-gray-200' : 'bg-gray-100'
                        }`}>
                          {getConfidenceIndicator(line.confidence)}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Text Content */}
                  <p className={`text-gray-900 text-xs sm:text-base leading-relaxed transition-all mb-3 ${
                    isActive ? 'font-medium text-green-900' : ''
                  }`}>
                    {line.words && line.words.length > 0 ? (
                      line.words.map((word, wordIndex) => (
                        <span
                          key={wordIndex}
                          className={`transition-all duration-200 ${
                            currentTime >= word.start && currentTime <= word.end
                              ? 'bg-yellow-300 text-gray-900 font-semibold px-0.5 sm:px-1 rounded'
                              : ''
                          }`}
                        >
                          {word.word}{' '}
                        </span>
                      ))
                    ) : (
                      <span>{line.text}</span>
                    )}
                  </p>

                  {/* AI Action Buttons */}
                  <AIActionButtons
                    text={line.text}
                    language={language}
                    onExpand={() => toggleCardExpansion(index)}
                    isExpanded={isExpanded}
                  />
                  
                  {/* Progress bar for active line */}
                  {isActive && (
                    <div className="mt-2 sm:mt-4 bg-green-200 rounded-full h-1.5 sm:h-2 overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-green-500 to-green-600 h-full transition-all duration-200"
                        style={{
                          width: `${Math.min(100, Math.max(0, ((currentTime - line.startTime) / (line.endTime - line.startTime)) * 100))}%`
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
};

export default TranscriptionResult;
