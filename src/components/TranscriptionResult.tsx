
import React from 'react';
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Clipboard, ClipboardCheck } from 'lucide-react';

interface TranscriptionResultProps {
  transcription: string;
  isTranscribing: boolean;
}

const TranscriptionResult: React.FC<TranscriptionResultProps> = ({ transcription, isTranscribing }) => {
  const [copied, setCopied] = React.useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(transcription);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isTranscribing) {
    return (
      <div className="bg-gray-50 rounded-lg p-4 h-80">
        <div className="animate-pulse space-y-3">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-4/6" />
          <div className="py-2"></div>
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </div>
    );
  }

  if (!transcription) {
    return (
      <div className="bg-gray-50 rounded-lg p-4 h-80 flex items-center justify-center text-center">
        <div className="text-gray-500">
          <p className="mb-2 text-sm">Your transcription will appear here</p>
          <p className="text-xs">Upload a file and click "Transcribe Now" to begin</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 flex flex-col h-80">
      <div className="flex justify-between items-center px-4 py-2 border-b">
        <h3 className="font-medium text-gray-700">Transcription</h3>
        <Button
          variant="ghost"
          size="sm"
          className="text-xs flex items-center gap-1"
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
      
      <ScrollArea className="flex-1 p-4">
        <p className="text-gray-700 whitespace-pre-line">{transcription}</p>
      </ScrollArea>
    </div>
  );
};

export default TranscriptionResult;
