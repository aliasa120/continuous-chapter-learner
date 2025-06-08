
import React from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Clipboard, ClipboardCheck, Play, Pause, Award, Grid3X3, Eye, Zap, FileText } from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';
import TimestampCard from './TimestampCard';
import WordHighlight from './WordHighlight';
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
  const { autoScroll, showConfidence } = useSettings();

  const copyToClipboard = () => {
    const fullText = transcriptionLines
      .map(line => {
        const confidence = line.confidence && showConfidence ? ` (${line.confidence}%)` : '';
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
    return actions.slice(0, 10);
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

  React.useEffect(() => {
    if (activeLineRef.current && isPlaying && autoScroll) {
      activeLineRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }
  }, [currentTime, isPlaying, autoScroll]);

  if (isTranscribing) {
    return (
      <div className="h-[500px] sm:h-[600px]">
        <div className="flex justify-center items-center h-full">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto border-4 rounded-full border-l-primary border-r-primary/30 border-b-primary border-t-primary/30 animate-spin mb-4"></div>
            <p className="text-foreground animate-pulse text-lg font-semibold">Enhanced AI Processing...</p>
            <p className="text-muted-foreground mt-2">Speaker identification • Confidence scoring • Precise timing</p>
            <div className="mt-4 bg-primary/10 rounded-lg p-4 max-w-sm mx-auto">
              <p className="text-primary font-medium">🚀 Gemini 2.5 Flash Preview</p>
              <p className="text-xs text-primary/80 mt-1">Advanced AI transcription in progress</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (transcriptionLines.length === 0) {
    return (
      <div className="h-[500px] sm:h-[600px] flex items-center justify-center text-center">
        <div className="text-muted-foreground max-w-md mx-auto">
          <div className="text-6xl mb-6">🎯</div>
          <h3 className="text-xl font-semibold text-foreground mb-2">Enhanced transcription results will appear here</h3>
          <p className="text-muted-foreground mb-6">Upload an audio or video file and start enhanced AI transcription</p>
          <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
            <h4 className="text-primary font-medium mb-2">Features Available:</h4>
            <div className="grid grid-cols-2 gap-2 text-xs text-primary/80">
              <div>• Speaker Identification</div>
              <div>• Word-level Sync</div>
              <div>• Confidence Scoring</div>
              <div>• Easy View Mode</div>
              <div>• Action Detection</div>
              <div>• AI Analysis</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const averageConfidence = transcriptionLines.reduce((sum, line) => sum + (line.confidence || 0), 0) / transcriptionLines.length;
  const actionItems = getActionItems();
  const summary = generateSummary();

  return (
    <div className="h-[500px] sm:h-[600px]">
      <Tabs defaultValue="segments" className="h-full flex flex-col">
        <div className="flex justify-between items-center px-4 sm:px-6 py-3 border-b bg-card/50 backdrop-blur-sm">
          <TabsList className="grid w-auto grid-cols-3 bg-muted/50">
            <TabsTrigger value="segments" className="flex items-center gap-2 text-xs sm:text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Grid3X3 className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Segments</span>
              <span className="sm:hidden">Seg</span>
              <Badge variant="secondary" className="ml-1 text-xs px-1.5 py-0.5">
                {transcriptionLines.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="easy-view" className="flex items-center gap-2 text-xs sm:text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Easy View</span>
              <span className="sm:hidden">Easy</span>
            </TabsTrigger>
            <TabsTrigger value="actions" className="flex items-center gap-2 text-xs sm:text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Zap className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Actions</span>
              <span className="sm:hidden">Act</span>
              {actionItems.length > 0 && (
                <Badge variant="secondary" className="ml-1 text-xs px-1.5 py-0.5">
                  {actionItems.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="text-xs flex items-center gap-1 text-primary hover:bg-primary/10 border-primary/20 h-8"
              onClick={onPlayPause}
            >
              {isPlaying ? (
                <Pause className="h-3 w-3" />
              ) : (
                <Play className="h-3 w-3" />
              )}
              <span className="hidden sm:inline">{isPlaying ? "Pause" : "Play"}</span>
            </Button>
            
            {showConfidence && (
              <div className="hidden md:flex items-center gap-1 text-xs text-muted-foreground bg-muted rounded px-2 py-1">
                <Award className="h-3 w-3" />
                <span>Avg: {averageConfidence.toFixed(0)}%</span>
              </div>
            )}
            
            <Button
              variant="outline"
              size="sm"
              className="text-xs flex items-center gap-1 text-foreground hover:bg-muted border-foreground/20 h-8 font-semibold"
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
        </div>
        
        <div className="flex-1 overflow-hidden">
          <TabsContent value="segments" className="h-full m-0">
            <ScrollArea className="h-full p-3 sm:p-4">
              <div className="space-y-3 sm:space-y-4">
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
                        isPlaying={isActive && isPlaying}
                        globalIsPlaying={isPlaying}
                        onGlobalPlayPause={onPlayPause}
                      />
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="easy-view" className="h-full m-0 p-4 sm:p-6">
            <ScrollArea className="h-full">
              <div className="space-y-6">
                <div className="flex items-center gap-2 mb-4">
                  <FileText className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-semibold text-foreground">Easy Reading View</h3>
                </div>
                
                <div className="bg-card/50 border border-border rounded-lg p-4 sm:p-6">
                  <h4 className="text-md font-medium text-foreground mb-3">Summary</h4>
                  <div className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                    {summary}
                  </div>
                </div>
                
                <div className="bg-card/50 border border-border rounded-lg p-4 sm:p-6">
                  <h4 className="text-md font-medium text-foreground mb-3">Full Transcript</h4>
                  <div className="prose dark:prose-invert max-w-none">
                    {transcriptionLines.map((line, index) => {
                      const isActive = isLineActive(line);
                      return (
                        <div 
                          key={index} 
                          className={`mb-2 p-2 rounded transition-all duration-300 ${
                            isActive ? 'bg-primary/10 border-l-4 border-primary' : ''
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
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="actions" className="h-full m-0 p-4 sm:p-6">
            <ScrollArea className="h-full">
              <div className="space-y-6">
                <div className="flex items-center gap-2 mb-4">
                  <Zap className="h-5 w-5 text-accent" />
                  <h3 className="text-lg font-semibold text-foreground">Action Items & Key Points</h3>
                </div>
                
                {actionItems.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-4">🔍</div>
                    <p className="text-muted-foreground">No specific action items detected in this transcription.</p>
                    <p className="text-sm text-muted-foreground mt-2">Action detection looks for words like "task", "action", "need to", "should", etc.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="bg-accent/10 border border-accent/20 rounded-lg p-4">
                      <h4 className="text-md font-medium text-accent mb-3">
                        Detected Actions ({actionItems.length})
                      </h4>
                      <ul className="space-y-3">
                        {actionItems.map((action, index) => (
                          <li key={index} className="flex items-start text-sm">
                            <span className="text-accent mr-3 mt-1 font-bold">•</span>
                            <span className="text-foreground leading-relaxed">{action}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
                      <h4 className="text-md font-medium text-primary mb-3">Quick Stats</h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Total segments:</span>
                          <span className="text-foreground font-medium ml-2">{transcriptionLines.length}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Action items:</span>
                          <span className="text-foreground font-medium ml-2">{actionItems.length}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Avg confidence:</span>
                          <span className="text-foreground font-medium ml-2">{averageConfidence.toFixed(0)}%</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Speakers:</span>
                          <span className="text-foreground font-medium ml-2">
                            {new Set(transcriptionLines.map(l => l.speaker).filter(Boolean)).size || 1}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};

export default TranscriptionResult;
