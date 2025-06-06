
import React from 'react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Grid3X3, Eye, Zap } from 'lucide-react';
import TranscriptionResult from './TranscriptionResult';
import type { TranscriptionLine } from '../utils/geminiTranscription';

interface MobileTranscriptionResultProps {
  transcriptionLines: TranscriptionLine[];
  isTranscribing: boolean;
  currentTime: number;
  seekToTimestamp: (seconds: number) => void;
  isPlaying: boolean;
  onPlayPause: () => void;
}

const MobileTranscriptionResult: React.FC<MobileTranscriptionResultProps> = ({
  transcriptionLines,
  isTranscribing,
  currentTime,
  seekToTimestamp,
  isPlaying,
  onPlayPause
}) => {
  const getActions = () => {
    const allActions: string[] = [];
    transcriptionLines.forEach(line => {
      // Extract action-oriented keywords from text
      const text = line.text.toLowerCase();
      if (text.includes('action') || text.includes('task') || text.includes('do') || 
          text.includes('will') || text.includes('should') || text.includes('need to') ||
          text.includes('must') || text.includes('plan') || text.includes('decide')) {
        allActions.push(line.text);
      }
    });
    return allActions.slice(0, 5); // Show top 5 actions
  };

  return (
    <Card className="h-96 sm:h-[500px] border-green-200 dark:border-gray-700 shadow-lg">
      <Tabs defaultValue="segments" className="h-full flex flex-col">
        <TabsList className="grid w-full grid-cols-3 bg-green-50 dark:bg-gray-800">
          <TabsTrigger value="segments" className="flex items-center gap-1 text-xs sm:text-sm">
            <Grid3X3 className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Segments</span>
            <span className="sm:hidden">Seg</span>
            {transcriptionLines.length > 0 && (
              <span className="ml-1 bg-green-600 text-white text-xs px-1.5 py-0.5 rounded-full">
                {transcriptionLines.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="easy-view" className="flex items-center gap-1 text-xs sm:text-sm">
            <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Easy View</span>
            <span className="sm:hidden">Easy</span>
          </TabsTrigger>
          <TabsTrigger value="actions" className="flex items-center gap-1 text-xs sm:text-sm">
            <Zap className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Actions</span>
            <span className="sm:hidden">Act</span>
          </TabsTrigger>
        </TabsList>
        
        <div className="flex-1 overflow-hidden">
          <TabsContent value="segments" className="h-full m-0">
            <TranscriptionResult
              transcriptionLines={transcriptionLines}
              isTranscribing={isTranscribing}
              currentTime={currentTime}
              seekToTimestamp={seekToTimestamp}
              isPlaying={isPlaying}
              onPlayPause={onPlayPause}
            />
          </TabsContent>
          
          <TabsContent value="easy-view" className="h-full m-0 p-4 overflow-y-auto">
            {isTranscribing ? (
              <div className="flex justify-center items-center h-full">
                <div className="text-center">
                  <div className="w-8 h-8 mx-auto border-4 rounded-full border-l-green-600 border-r-green-300 border-b-green-600 border-t-green-300 animate-spin mb-2"></div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Processing...</p>
                </div>
              </div>
            ) : transcriptionLines.length === 0 ? (
              <div className="flex items-center justify-center h-full text-center">
                <div className="text-gray-500 dark:text-gray-400">
                  <div className="text-2xl mb-2">📝</div>
                  <p className="text-sm">Easy view will show simplified transcription</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-green-700 dark:text-green-400">Easy View</h3>
                <div className="prose dark:prose-invert max-w-none">
                  <p className="text-sm sm:text-base leading-relaxed text-gray-700 dark:text-gray-300">
                    {transcriptionLines.map(line => line.text).join(' ')}
                  </p>
                </div>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="actions" className="h-full m-0 p-4 overflow-y-auto">
            {isTranscribing ? (
              <div className="flex justify-center items-center h-full">
                <div className="text-center">
                  <div className="w-8 h-8 mx-auto border-4 rounded-full border-l-green-600 border-r-green-300 border-b-green-600 border-t-green-300 animate-spin mb-2"></div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Analyzing actions...</p>
                </div>
              </div>
            ) : transcriptionLines.length === 0 ? (
              <div className="flex items-center justify-center h-full text-center">
                <div className="text-gray-500 dark:text-gray-400">
                  <div className="text-2xl mb-2">⚡</div>
                  <p className="text-sm">Action items will appear here</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-green-700 dark:text-green-400">Action Items</h3>
                {getActions().length === 0 ? (
                  <p className="text-sm text-gray-600 dark:text-gray-400">No specific actions identified in this transcription.</p>
                ) : (
                  <ul className="space-y-2">
                    {getActions().map((action, index) => (
                      <li key={index} className="flex items-start text-sm">
                        <span className="text-green-600 dark:text-green-400 mr-2 mt-1">•</span>
                        <span className="text-gray-700 dark:text-gray-300">{action}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </TabsContent>
        </div>
      </Tabs>
    </Card>
  );
};

export default MobileTranscriptionResult;
