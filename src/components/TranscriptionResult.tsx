
import React from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Clipboard, ClipboardCheck, Play, Pause, User, Award, Clock } from 'lucide-react';
import type { TranscriptionLine } from '../utils/groqGeminiTranscription';

interface TranscriptionResultProps {
  transcriptionLines: TranscriptionLine[];
  isTranscribing: boolean;
  currentTime: number;
  seekToTimestamp: (seconds: number) => void;
  isPlaying: boolean;
  onPlayPause: () => void;
}

const TranscriptionResult: React.FC<TranscriptionResultProps> = ({
  transcriptionLines,
  isTranscribing,
  currentTime,
  seekToTimestamp,
  isPlaying,
  onPlayPause
}) => {
  const [copied, setCopied] = React.useState(false);
  const activeLineRef = React.useRef<HTMLDivElement>(null);

  const copyToClipboard = () => {
    const fullText = transcriptionLines
      .map(line => {
        const confidence = line.confidence ? ` (${line.confidence}%)` : '';
        const speaker = line.speaker ? ` ${line.speaker}` : '';
        return `${line.timestamp}${speaker}${confidence}: ${line.text}`;
      })
      .join('\n');
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

  const renderTextWithWordHighlighting = (line: TranscriptionLine) => {
    if (!line.words || line.words.length === 0) {
      return <span>{line.text}</span>;
    }

    return (
      <span>
        {line.words.map((word, wordIndex) => (
          <span
            key={wordIndex}
            className={`transition-all duration-200 ${
              isWordActive(word)
                ? 'bg-yellow-300 text-gray-900 font-semibold px-1 rounded shadow-sm'
                : ''
            }`}
          >
            {word.word}{' '}
          </span>
        ))}
      </span>
    );
  };

  const getConfidenceColor = (confidence?: number) => {
    if (!confidence) return 'text-gray-500';
    if (confidence >= 95) return 'text-green-600';
    if (confidence >= 85) return 'text-yellow-600';
    return 'text-red-500';
  };

  const getConfidenceIcon = (confidence?: number) => {
    if (!confidence) return null;
    if (confidence >= 95) return '🟢';
    if (confidence >= 85) return '🟡';
    return '🔴';
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
      <div className="p-4 sm:p-6 h-80 sm:h-96">
        <div className="flex justify-center items-center h-full">
          <div className="text-center">
            <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto border-4 rounded-full border-l-green-600 border-r-green-300 border-b-green-600 border-t-green-300 animate-spin mb-4"></div>
            <p className="text-gray-900 animate-pulse text-sm sm:text-base font-semibold">Smart AI Processing...</p>
            <p className="text-xs sm:text-sm text-gray-600 mt-2">Speaker detection • Word-level sync • Precise timing</p>
            <div className="mt-4 bg-green-50 rounded-lg p-3">
              <p className="text-xs text-green-700">⚡ Cost-optimized processing</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (transcriptionLines.length === 0) {
    return (
      <div className="p-4 sm:p-6 h-80 sm:h-96 flex items-center justify-center text-center">
        <div className="text-gray-600">
          <div className="text-4xl mb-4">🎯</div>
          <p className="mb-2 text-sm font-medium">Smart transcription results will appear here</p>
          <p className="text-xs">Upload a file and start AI transcription</p>
          <div className="mt-4 text-xs text-green-600 bg-green-50 rounded-lg p-2">
            Features: Word highlighting • Speaker ID • Confidence • Translation
          </div>
        </div>
      </div>
    );
  }

  const averageConfidence = transcriptionLines.reduce((sum, line) => sum + (line.confidence || 0), 0) / transcriptionLines.length;

  return (
    <div className="flex flex-col h-80 sm:h-96">
      {/* Enhanced Controls Bar with Prominent Play/Pause */}
      <div className="flex justify-between items-center px-3 sm:px-6 py-3 border-b border-gray-200 bg-gradient-to-r from-green-50 to-emerald-50">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            className="text-sm flex items-center gap-2 text-white bg-green-600 hover:bg-green-700 border-green-600 h-9 px-4 font-medium shadow-sm"
            onClick={onPlayPause}
          >
            {isPlaying ? (
              <Pause className="h-4 w-4" />
            ) : (
              <Play className="h-4 w-4" />
            )}
            <span>{isPlaying ? "Pause" : "Play"}</span>
          </Button>
          
          <div className="hidden md:flex items-center gap-1 text-xs text-gray-600 bg-white rounded px-2 py-1 border">
            <Award className="h-3 w-3" />
            <span>Avg: {averageConfidence.toFixed(0)}%</span>
          </div>
        </div>
        
        <div className="text-xs text-gray-500 hidden sm:block font-medium">
          {transcriptionLines.length} segments
        </div>
        
        <Button
          variant="outline"
          size="sm"
          className="text-xs flex items-center gap-1 text-green-700 hover:bg-green-50 border-green-200 h-8"
          onClick={copyToClipboard}
        >
          {copied ? (
            <>
              <ClipboardCheck className="h-3 w-3" />
              <span className="hidden sm:inline">Copied</span>
            </>
          ) : (
            <>
              <Clipboard className="h-3 w-3" />
              <span className="hidden sm:inline">Copy All</span>
            </>
          )}
        </Button>
      </div>
      
      {/* Enhanced Transcription Lines with Word-Level Highlighting */}
      <ScrollArea className="flex-1 p-2 sm:p-3">
        <div className="space-y-2 sm:space-y-3">
          {transcriptionLines.map((line, index) => {
            const isActive = isLineActive(line);
            
            return (
              <div 
                key={index}
                ref={isActive ? activeLineRef : null}
                className={`rounded-lg border p-4 transition-all duration-300 cursor-pointer relative ${
                  isActive 
                    ? 'border-green-500 shadow-lg bg-green-50 ring-2 ring-green-200 transform scale-[1.02] z-10' 
                    : 'border-gray-200 hover:border-green-300 bg-white hover:shadow-sm'
                }`}
                onClick={() => seekToTimestamp(line.startTime)}
                style={{
                  position: 'relative',
                  zIndex: isActive ? 10 : 1
                }}
              >
                {/* Individual Play Button for Each Line */}
                <Button 
                  variant="outline" 
                  size="sm" 
                  className={`absolute top-2 right-2 h-8 w-8 p-0 rounded-full transition-all ${
                    isActive 
                      ? 'text-green-800 border-green-600 bg-green-200 shadow-md hover:bg-green-300' 
                      : 'hover:text-green-700 text-gray-500 border-gray-300 hover:border-green-400'
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    seekToTimestamp(line.startTime);
                  }}
                >
                  <Play className="h-3 w-3" />
                </Button>

                <div className="flex flex-col pr-10">
                  {/* Enhanced Header Row */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-xs sm:text-sm font-mono px-2 py-1 rounded flex items-center gap-1 ${
                        isActive ? 'text-green-800 bg-green-200' : 'text-green-700 bg-green-100'
                      }`}>
                        <Clock className="h-3 w-3" />
                        {line.timestamp}
                      </span>
                      {line.speaker && (
                        <div className={`flex items-center gap-1 text-xs px-2 py-1 rounded ${
                          isActive ? 'text-blue-800 bg-blue-200' : 'text-blue-600 bg-blue-100'
                        }`}>
                          <User className="h-3 w-3" />
                          <span>{line.speaker}</span>
                        </div>
                      )}
                      {line.confidence && (
                        <div className={`flex items-center gap-1 text-xs px-2 py-1 rounded ${
                          isActive ? 'bg-gray-200' : 'bg-gray-100'
                        } ${getConfidenceColor(line.confidence)}`}>
                          <Award className="h-3 w-3" />
                          <span>{getConfidenceIcon(line.confidence)} {line.confidence}%</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Enhanced Text Content with Word-Level Highlighting */}
                  <p className={`text-gray-900 text-sm sm:text-base leading-relaxed transition-all ${
                    isActive ? 'font-medium text-green-900' : ''
                  }`}>
                    {renderTextWithWordHighlighting(line)}
                  </p>
                  
                  {/* Enhanced progress bar for active line */}
                  {isActive && (
                    <div className="mt-4 bg-green-200 rounded-full h-2 overflow-hidden shadow-inner">
                      <div 
                        className="bg-gradient-to-r from-green-500 to-green-600 h-full transition-all duration-200 shadow-sm"
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
