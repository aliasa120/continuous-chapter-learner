
import React from 'react';
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Clipboard, ClipboardCheck, Play, Pause } from 'lucide-react';
import type { TranscriptionLine } from '../pages/TranscribePage';

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

  const copyToClipboard = () => {
    const fullText = transcriptionLines.map(line => `${line.timestamp}: ${line.text}`).join('\n');
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Check if line is currently active based on timestamps
  const isLineActive = (line: TranscriptionLine, nextLineStartTime: number | undefined) => {
    return currentTime >= line.startTime && 
           (nextLineStartTime === undefined || currentTime < nextLineStartTime);
  };

  if (isTranscribing) {
    return (
      <div className="p-6 h-96">
        <div className="flex justify-center items-center h-full">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto border-4 rounded-full border-l-green-600 border-r-green-300 border-b-green-600 border-t-green-300 animate-spin mb-4"></div>
            <p className="text-gray-700 animate-pulse">Transcribing your content...</p>
            <p className="text-sm text-gray-500 mt-2">This may take a minute</p>
          </div>
        </div>
      </div>
    );
  }

  if (transcriptionLines.length === 0) {
    return (
      <div className="p-6 h-96 flex items-center justify-center text-center">
        <div className="text-gray-500">
          <p className="mb-2 text-sm">Your transcription will appear here</p>
          <p className="text-xs">Upload a file and click "Start Transcription" to begin</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-96">
      <div className="flex justify-between items-center px-6 py-2 border-b border-green-100 bg-green-50">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="sm"
            className="text-xs flex items-center gap-1 mr-2 text-green-700 hover:bg-green-100 hover:text-green-800"
            onClick={onPlayPause}
          >
            {isPlaying ? (
              <Pause className="h-4 w-4" />
            ) : (
              <Play className="h-4 w-4" />
            )}
            <span>{isPlaying ? "Pause" : "Play"}</span>
          </Button>
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          className="text-xs flex items-center gap-1 text-green-700 hover:bg-green-100 hover:text-green-800"
          onClick={copyToClipboard}
        >
          {copied ? (
            <>
              <ClipboardCheck className="h-4 w-4" />
              <span>Copied</span>
            </>
          ) : (
            <>
              <Clipboard className="h-4 w-4" />
              <span>Copy text</span>
            </>
          )}
        </Button>
      </div>
      
      <ScrollArea className="flex-1 p-3">
        <div className="space-y-3">
          {transcriptionLines.map((line, index) => {
            const nextLineStartTime = index < transcriptionLines.length - 1 ? 
              transcriptionLines[index + 1].startTime : undefined;
            const isActive = isLineActive(line, nextLineStartTime);
            
            return (
              <div 
                key={index}
                className={`rounded-lg border p-3 transition-all ${
                  isActive ? 'bg-green-50 border-green-300 shadow-md' : 'bg-white border-gray-100 hover:border-green-200'
                }`}
                onClick={() => seekToTimestamp(line.startTime)}
              >
                <div className="flex">
                  <div className="w-20 flex-shrink-0 text-sm font-mono text-green-700">
                    {line.timestamp}
                  </div>
                  <p className="text-gray-700 flex-1">
                    {isActive ? (
                      <span className="font-medium text-green-800">{line.text}</span>
                    ) : (
                      line.text
                    )}
                  </p>
                  <div className="ml-2">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className={`h-6 w-6 p-0 rounded-full ${isActive ? 'bg-green-100 text-green-700' : 'hover:bg-green-50 text-gray-400 hover:text-green-600'}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        seekToTimestamp(line.startTime);
                      }}
                    >
                      <Play className="h-3 w-3" />
                    </Button>
                  </div>
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
