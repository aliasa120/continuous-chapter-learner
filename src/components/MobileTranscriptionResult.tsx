
import React, { useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Grid3X3, Eye, Zap, FileText, Award } from 'lucide-react';
import TimestampCard from './TimestampCard';
import WordHighlight from './WordHighlight';
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
  const activeLineRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const isLineActive = (line: TranscriptionLine) => {
    return currentTime >= line.startTime && currentTime <= line.endTime;
  };

  // Mobile-specific scroll behavior - scroll up to show current line at top
  useEffect(() => {
    if (activeLineRef.current && scrollAreaRef.current && isPlaying) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        const activeElement = activeLineRef.current;
        const containerRect = scrollContainer.getBoundingClientRect();
        const elementRect = activeElement.getBoundingClientRect();
        
        // Calculate scroll position to show active line at the top with some padding
        const scrollTop = elementRect.top - containerRect.top + scrollContainer.scrollTop - 20;
        
        scrollContainer.scrollTo({
          top: scrollTop,
          behavior: 'smooth'
        });
      }
    }
  }, [currentTime, isPlaying]);

  const getActionItems = () => {
    const actions: string[] = [];
    transcriptionLines.forEach(line => {
      const text = line.text.toLowerCase();
      if (text.includes('action') || text.includes('task') || text.includes('do') || 
          text.includes('will') || text.includes('should') || text.includes('need to') ||
          text.includes('must') || text.includes('plan') || text.includes('decide') ||
          text.includes('next step') || text.includes('follow up') || text.includes('reminder')) {
        actions.push(line.text);
      }
    });
    return actions.slice(0, 8);
  };

  const generateSummary = () => {
    if (transcriptionLines.length === 0) return '';
    
    const allText = transcriptionLines.map(line => line.text).join(' ');
    const sentences = allText.split('.').filter(s => s.trim().length > 10);
    const keyPoints = sentences.slice(0, 3).map(s => s.trim()).filter(Boolean);
    
    return keyPoints.length > 0 
      ? keyPoints.map(point => `• ${point}.`).join('\n')
      : 'Summary will be generated from the transcription content.';
  };

  const actionItems = getActionItems();
  const summary = generateSummary();

  return (
    <Card className="h-96 sm:h-[500px] border-primary/20 shadow-lg bg-card backdrop-blur">
      <Tabs defaultValue="segments" className="h-full flex flex-col">
        <TabsList className="grid w-full grid-cols-3 bg-muted/50 m-1 h-9">
          <TabsTrigger value="segments" className="flex items-center gap-1 text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground px-2 py-1">
            <Grid3X3 className="h-3 w-3" />
            <span className="hidden sm:inline">Segments</span>
            <span className="sm:hidden">Seg</span>
            {transcriptionLines.length > 0 && (
              <Badge variant="secondary" className="ml-1 text-xs px-1 py-0">
                {transcriptionLines.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="easy-view" className="flex items-center gap-1 text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground px-2 py-1">
            <Eye className="h-3 w-3" />
            <span className="hidden sm:inline">Easy View</span>
            <span className="sm:hidden">Easy</span>
          </TabsTrigger>
          <TabsTrigger value="actions" className="flex items-center gap-1 text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground px-2 py-1">
            <Zap className="h-3 w-3" />
            <span className="hidden sm:inline">Actions</span>
            <span className="sm:hidden">Act</span>
            {actionItems.length > 0 && (
              <Badge variant="secondary" className="ml-1 text-xs px-1 py-0">
                {actionItems.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>
        
        <div className="flex-1 overflow-hidden">
          <TabsContent value="segments" className="h-full m-0">
            {isTranscribing ? (
              <div className="flex justify-center items-center h-full">
                <div className="text-center p-2">
                  <div className="w-10 h-10 mx-auto border-4 rounded-full border-l-primary border-r-primary/30 border-b-primary border-t-primary/30 animate-spin mb-3"></div>
                  <p className="text-foreground animate-pulse text-sm font-semibold">Enhanced AI Processing...</p>
                  <p className="text-xs text-muted-foreground mt-1">Speaker identification • Confidence scoring • Precise timing</p>
                  <div className="mt-2 bg-primary/10 rounded-lg p-2">
                    <p className="text-xs text-primary">🚀 Gemini 2.5 Flash Preview</p>
                  </div>
                </div>
              </div>
            ) : transcriptionLines.length === 0 ? (
              <div className="flex items-center justify-center h-full text-center p-3">
                <div className="text-muted-foreground">
                  <div className="text-2xl mb-2">🎯</div>
                  <p className="mb-1 text-sm font-medium text-foreground">Enhanced transcription results will appear here</p>
                  <p className="text-xs text-muted-foreground">Upload a file and start enhanced AI transcription</p>
                  <div className="mt-2 text-xs text-primary bg-primary/10 rounded-lg p-2">
                    Features: Speaker ID • Confidence • Sync • AI Analysis
                  </div>
                </div>
              </div>
            ) : (
              <ScrollArea className="h-full" ref={scrollAreaRef}>
                <div className="space-y-1 p-1">
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
            )}
          </TabsContent>
          
          <TabsContent value="easy-view" className="h-full m-0">
            <ScrollArea className="h-full p-2">
              {isTranscribing ? (
                <div className="flex justify-center items-center h-full">
                  <div className="text-center">
                    <div className="w-6 h-6 mx-auto border-4 rounded-full border-l-primary border-r-primary/30 border-b-primary border-t-primary/30 animate-spin mb-1"></div>
                    <p className="text-sm text-muted-foreground">Processing...</p>
                  </div>
                </div>
              ) : transcriptionLines.length === 0 ? (
                <div className="flex items-center justify-center h-full text-center">
                  <div className="text-muted-foreground">
                    <div className="text-xl mb-1">📝</div>
                    <p className="text-sm">Easy view will show simplified transcription</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-primary" />
                    <h3 className="text-sm font-semibold text-foreground">Easy Reading View</h3>
                  </div>
                  
                  <div className="bg-card/50 border border-border rounded-lg p-2">
                    <h4 className="text-sm font-medium text-foreground mb-1">Summary</h4>
                    <div className="text-xs text-muted-foreground leading-relaxed whitespace-pre-line">
                      {summary}
                    </div>
                  </div>
                  
                  <div className="bg-card/50 border border-border rounded-lg p-2">
                    <h4 className="text-sm font-medium text-foreground mb-1">Full Transcript</h4>
                    <div className="prose dark:prose-invert max-w-none">
                      {transcriptionLines.map((line, index) => {
                        const isActive = isLineActive(line);
                        return (
                          <div 
                            key={index} 
                            className={`mb-1 p-1 rounded transition-all duration-300 ${
                              isActive ? 'bg-primary/10 border-l-2 border-primary' : ''
                            }`}
                          >
                            <WordHighlight
                              text={line.text}
                              currentTime={currentTime}
                              startTime={line.startTime}
                              endTime={line.endTime}
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="actions" className="h-full m-0">
            <ScrollArea className="h-full p-2">
              {isTranscribing ? (
                <div className="flex justify-center items-center h-full">
                  <div className="text-center">
                    <div className="w-6 h-6 mx-auto border-4 rounded-full border-l-primary border-r-primary/30 border-b-primary border-t-primary/30 animate-spin mb-1"></div>
                    <p className="text-sm text-muted-foreground">Analyzing actions...</p>
                  </div>
                </div>
              ) : transcriptionLines.length === 0 ? (
                <div className="flex items-center justify-center h-full text-center">
                  <div className="text-muted-foreground">
                    <div className="text-xl mb-1">⚡</div>
                    <p className="text-sm">Action items will appear here</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-accent" />
                    <h3 className="text-sm font-semibold text-foreground">Action Items & Key Points</h3>
                  </div>
                  
                  {actionItems.length === 0 ? (
                    <div className="text-center py-4">
                      <div className="text-2xl mb-2">🔍</div>
                      <p className="text-sm text-muted-foreground">No specific action items detected in this transcription.</p>
                      <p className="text-xs text-muted-foreground mt-1">Action detection looks for words like "task", "action", "need to", "should", etc.</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="bg-accent/10 border border-accent/20 rounded-lg p-2">
                        <h4 className="text-sm font-medium text-accent mb-1">
                          Detected Actions ({actionItems.length})
                        </h4>
                        <ul className="space-y-1">
                          {actionItems.map((action, index) => (
                            <li key={index} className="flex items-start text-xs">
                              <span className="text-accent mr-1 mt-0.5 font-bold">•</span>
                              <span className="text-foreground leading-relaxed">{action}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <div className="bg-primary/10 border border-primary/20 rounded-lg p-2">
                        <h4 className="text-sm font-medium text-primary mb-1">Quick Stats</h4>
                        <div className="grid grid-cols-2 gap-1 text-xs">
                          <div>
                            <span className="text-muted-foreground">Segments:</span>
                            <span className="text-foreground font-medium ml-1">{transcriptionLines.length}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Actions:</span>
                            <span className="text-foreground font-medium ml-1">{actionItems.length}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Speakers:</span>
                            <span className="text-foreground font-medium ml-1">
                              {new Set(transcriptionLines.map(l => l.speaker).filter(Boolean)).size || 1}
                            </span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Avg Conf:</span>
                            <span className="text-foreground font-medium ml-1">
                              {(transcriptionLines.reduce((sum, line) => sum + (line.confidence || 0), 0) / transcriptionLines.length).toFixed(0)}%
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </div>
      </Tabs>
    </Card>
  );
};

export default MobileTranscriptionResult;
