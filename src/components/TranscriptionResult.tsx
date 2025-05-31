
import React from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Clipboard, ClipboardCheck, Play, Pause, User } from 'lucide-react';
import type { TranscriptionLine } from '../utils/geminiTranscription';

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
      .map(line => `${line.timestamp}${line.speaker ? ` ${line.speaker}:` : ':'} ${line.text}`)
      .join('\n');
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isLineActive = (line: TranscriptionLine, nextLineStartTime: number | undefined) => {
    return currentTime >= line.startTime && 
           (nextLineStartTime === undefined || currentTime < nextLineStartTime);
  };

  // Auto-scroll to active line
  React.useEffect(() => {
    if (activeLineRef.current && isPlaying) {
      activeLineRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }
  }, [currentTime, isPlaying]);

  if (isTranscribing) {
    return (
      <div className="p-4 sm:p-6 h-80 sm:h-96">
        <div className="flex justify-center items-center h-full">
          <div className="text-center">
            <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto border-4 rounded-full border-l-green-600 border-r-green-300 border-b-green-600 border-t-green-300 animate-spin mb-4"></div>
            <p className="text-gray-900 animate-pulse text-sm sm:text-base">Processing with Google Gemini AI...</p>
            <p className="text-xs sm:text-sm text-gray-600 mt-2">Analyzing audio patterns and identifying speakers...</p>
          </div>
        </div>
      </div>
    );
  }

  if (transcriptionLines.length === 0) {
    return (
      <div className="p-4 sm:p-6 h-80 sm:h-96 flex items-center justify-center text-center">
        <div className="text-gray-600">
          <p className="mb-2 text-sm">Your transcription will appear here</p>
          <p className="text-xs">Upload a file and click "Start Transcription" to begin</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-80 sm:h-96">
      {/* Controls Bar - Mobile Optimized */}
      <div className="flex justify-between items-center px-3 sm:px-6 py-2 border-b border-gray-200">
        <Button
          variant="outline"
          size="sm"
          className="text-xs flex items-center gap-1 text-green-700 hover:bg-green-50 border-green-200 h-8"
          onClick={onPlayPause}
        >
          {isPlaying ? (
            <Pause className="h-3 w-3" />
          ) : (
            <Play className="h-3 w-3" />
          )}
          <span className="hidden sm:inline">{isPlaying ? "Pause" : "Play"}</span>
        </Button>
        
        <div className="text-xs text-gray-500 hidden sm:block">
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
              <span className="hidden sm:inline">Copy</span>
            </>
          )}
        </Button>
      </div>
      
      {/* Transcription Lines */}
      <ScrollArea className="flex-1 p-2 sm:p-3">
        <div className="space-y-2 sm:space-y-3">
          {transcriptionLines.map((line, index) => {
            const nextLineStartTime = index < transcriptionLines.length - 1 ? 
              transcriptionLines[index + 1].startTime : undefined;
            const isActive = isLineActive(line, nextLineStartTime);
            
            return (
              <div 
                key={index}
                ref={isActive ? activeLineRef : null}
                className={`rounded-lg border p-3 transition-all cursor-pointer ${
                  isActive 
                    ? 'border-green-500 shadow-md bg-green-50 ring-1 ring-green-200' 
                    : 'border-gray-200 hover:border-green-300 bg-white hover:shadow-sm'
                }`}
                onClick={() => seekToTimestamp(line.startTime)}
              >
                <div className="flex flex-col">
                  {/* Timestamp and Speaker Row */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs sm:text-sm font-mono text-green-700 bg-green-100 px-2 py-1 rounded">
                        {line.timestamp}
                      </span>
                      {line.speaker && (
                        <div className="flex items-center gap-1 text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">
                          <User className="h-3 w-3" />
                          <span>{line.speaker}</span>
                        </div>
                      )}
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className={`h-6 w-6 p-0 rounded-full ${
                        isActive 
                          ? 'text-green-700 border-green-500 bg-green-100' 
                          : 'hover:text-green-700 text-gray-500 border-gray-300'
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        seekToTimestamp(line.startTime);
                      }}
                    >
                      <Play className="h-3 w-3" />
                    </Button>
                  </div>
                  
                  {/* Text Content */}
                  <p className={`text-gray-900 text-sm sm:text-base leading-relaxed ${
                    isActive ? 'font-medium' : ''
                  }`}>
                    {line.text}
                  </p>
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
