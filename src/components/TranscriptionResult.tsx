
import React from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Clipboard, ClipboardCheck, Play, Pause, Award } from 'lucide-react';
import TimestampCard from './TimestampCard';
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

  // Auto-scroll to active line with improved logic
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
            <p className="text-gray-900 dark:text-gray-100 animate-pulse text-sm sm:text-base font-semibold">Enhanced AI Processing...</p>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-2">Speaker identification • Confidence scoring • Precise timing</p>
            <div className="mt-4 bg-green-50 dark:bg-green-900/30 rounded-lg p-3">
              <p className="text-xs text-green-700 dark:text-green-400">🚀 Gemini 2.5 Flash Preview</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (transcriptionLines.length === 0) {
    return (
      <div className="p-4 sm:p-6 h-80 sm:h-96 flex items-center justify-center text-center">
        <div className="text-gray-600 dark:text-gray-400">
          <div className="text-4xl mb-4">🎯</div>
          <p className="mb-2 text-sm font-medium">Enhanced transcription results will appear here</p>
          <p className="text-xs">Upload a file and start enhanced AI transcription</p>
          <div className="mt-4 text-xs text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30 rounded-lg p-2">
            Features: Speaker ID • Confidence • Sync • AI Analysis
          </div>
        </div>
      </div>
    );
  }

  const averageConfidence = transcriptionLines.reduce((sum, line) => sum + (line.confidence || 0), 0) / transcriptionLines.length;

  return (
    <div className="flex flex-col h-80 sm:h-96">
      {/* Enhanced Controls Bar */}
      <div className="flex justify-between items-center px-3 sm:px-6 py-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="text-xs flex items-center gap-1 text-green-700 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-800 border-green-200 dark:border-green-700 h-8"
            onClick={onPlayPause}
          >
            {isPlaying ? (
              <Pause className="h-3 w-3" />
            ) : (
              <Play className="h-3 w-3" />
            )}
            <span className="hidden sm:inline">{isPlaying ? "Pause" : "Play"}</span>
          </Button>
          
          <div className="hidden md:flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-700 rounded px-2 py-1">
            <Award className="h-3 w-3" />
            <span>Avg: {averageConfidence.toFixed(0)}%</span>
          </div>
        </div>
        
        <div className="text-xs text-gray-500 dark:text-gray-400 hidden sm:block">
          {transcriptionLines.length} segments
        </div>
        
        <Button
          variant="outline"
          size="sm"
          className="text-xs flex items-center gap-1 text-green-700 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-800 border-green-200 dark:border-green-700 h-8"
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
      
      {/* Enhanced Transcription Lines */}
      <ScrollArea className="flex-1 p-2 sm:p-3">
        <div className="space-y-2 sm:space-y-3">
          {transcriptionLines.map((line, index) => {
            const isActive = isLineActive(line);
            
            return (
              <div key={index} ref={isActive ? activeLineRef : null}>
                <TimestampCard
                  line={line}
                  index={index}
                  isActive={isActive}
                  currentTime={currentTime}
                  seekToTimestamp={seekToTimestamp}
                  isPlaying={isPlaying}
                />
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
};

export default TranscriptionResult;
