import React from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Clipboard, ClipboardCheck, Play, Pause, Award, Grid3X3, Eye, Target, CheckCircle, Wand2, Loader2, Download } from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';
import { useTranscript } from '../contexts/TranscriptContext';
import { useTranscriptionHistory } from '../hooks/useTranscriptionHistory';
import ExportDialog from './ExportDialog';
import { exportTranscription } from '../utils/exportFormats';
import TimestampCard from './TimestampCard';
import WordHighlight from './WordHighlight';
import type { TranscriptionLine } from '../utils/geminiTranscription';
import type { ActionItem } from '../hooks/useTranscriptionHistory';

interface TranscriptionResultProps {
  transcriptionLines: TranscriptionLine[];
  isTranscribing: boolean;
  currentTime: number;
  seekToTimestamp: (seconds: number) => void;
  isPlaying: boolean;
  onPlayPause: () => void;
  language?: string;
  filename?: string;
}

const TranscriptionResult: React.FC<TranscriptionResultProps> = ({
  transcriptionLines,
  isTranscribing,
  currentTime,
  seekToTimestamp,
  isPlaying,
  onPlayPause,
  language = 'en',
  filename = 'transcription'
}) => {
  const [copied, setCopied] = React.useState(false);
  const [showExportDialog, setShowExportDialogState] = React.useState(false);
  const [isGeneratingActions, setIsGeneratingActions] = React.useState(false);
  const activeLineRef = React.useRef<HTMLDivElement>(null);
  const { autoScroll, showConfidence, defaultExportFormat, showExportDialog: showExportDialogSetting } = useSettings();
  const { currentActions, setCurrentActions } = useTranscript();
  const { updateHistoryActions, history } = useTranscriptionHistory();

  // RTL languages
  const rtlLanguages = ['ar', 'he', 'ur', 'fa', 'ps', 'sd'];
  const isRTL = rtlLanguages.includes(language);

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

  const handleExport = () => {
    if (showExportDialogSetting) {
      setShowExportDialogState(true);
    } else {
      exportTranscription(transcriptionLines, defaultExportFormat as any, filename);
    }
  };

  const isLineActive = (line: TranscriptionLine) => {
    return currentTime >= line.startTime && currentTime <= line.endTime;
  };

  const generateActions = async () => {
    setIsGeneratingActions(true);
    
    try {
      const actionKeywords = [
        'action', 'task', 'do', 'will', 'should', 'need to', 'must', 'plan', 'decide',
        'next step', 'follow up', 'reminder', 'schedule', 'assign', 'complete', 'finish',
        'implement', 'create', 'build', 'send', 'call', 'email', 'meet', 'discuss',
        'review', 'approve', 'prepare', 'research', 'investigate', 'analyze', 'update',
        'deadline', 'due', 'priority', 'urgent', 'important', 'commit', 'promise',
        'agree', 'decision', 'resolve', 'fix', 'solve', 'address', 'handle'
      ];

      const actions: ActionItem[] = [];
      
      transcriptionLines.forEach((line, index) => {
        const text = line.text.toLowerCase();
        const hasActionKeyword = actionKeywords.some(keyword => text.includes(keyword));
        
        if (hasActionKeyword) {
          const sentences = line.text.split(/[.!?]+/).filter(s => s.trim().length > 10);
          sentences.forEach(sentence => {
            const sentenceLower = sentence.toLowerCase();
            if (actionKeywords.some(keyword => sentenceLower.includes(keyword))) {
              actions.push({
                text: sentence.trim(),
                timestamp: line.timestamp,
                speaker: line.speaker,
                index: index
              });
            }
          });
        }
      });
      
      const generatedActions = actions.slice(0, 15);
      setCurrentActions(generatedActions);

      // Update history if this transcript exists in history
      const currentHistoryItem = history.find(item => 
        item.transcriptionLines.length === transcriptionLines.length &&
        item.transcriptionLines[0]?.text === transcriptionLines[0]?.text
      );
      
      if (currentHistoryItem) {
        updateHistoryActions(currentHistoryItem.id, generatedActions);
      }
    } catch (error) {
      console.error('Failed to generate actions:', error);
    } finally {
      setIsGeneratingActions(false);
    }
  };

  const getMeetingInsights = () => {
    const insights = {
      decisions: [],
      questions: [],
      commitments: [],
      topics: []
    };

    transcriptionLines.forEach(line => {
      const text = line.text.toLowerCase();
      
      // Decision indicators
      if (text.includes('decide') || text.includes('agreed') || text.includes('conclusion') || text.includes('resolution')) {
        insights.decisions.push(line.text);
      }
      
      // Question indicators
      if (text.includes('?') || text.includes('question') || text.includes('clarify') || text.includes('understand')) {
        insights.questions.push(line.text);
      }
      
      // Commitment indicators
      if (text.includes('commit') || text.includes('promise') || text.includes('guarantee') || text.includes('ensure')) {
        insights.commitments.push(line.text);
      }
    });

    return insights;
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
        </div>
      </div>
    );
  }

  const averageConfidence = transcriptionLines.reduce((sum, line) => sum + (line.confidence || 0), 0) / transcriptionLines.length;
  const meetingInsights = getMeetingInsights();
  const summary = generateSummary();

  return (
    <>
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
                <Target className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Actions</span>
                <span className="sm:hidden">Act</span>
                {currentActions.length > 0 && (
                  <Badge variant="secondary" className="ml-1 text-xs px-1.5 py-0.5">
                    {currentActions.length}
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

              <Button
                variant="outline"
                size="sm"
                className="text-xs flex items-center gap-1 text-green-600 hover:bg-green-50 border-green-200 h-8 font-semibold"
                onClick={handleExport}
              >
                <Download className="h-3 w-3" />
                <span className="hidden sm:inline">Export</span>
              </Button>
            </div>
          </div>
          
          <div className="flex-1 overflow-hidden">
            <TabsContent value="segments" className="h-full m-0">
              <ScrollArea className="h-full p-3 sm:p-4">
                <div className="space-y-3 sm:space-y-4" dir={isRTL ? 'rtl' : 'ltr'}>
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
                          language={language}
                        />
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            </TabsContent>
            
            <TabsContent value="easy-view" className="h-full m-0 p-4 sm:p-6">
              <ScrollArea className="h-full">
                <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
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
                              language={language}
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
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Target className="h-5 w-5 text-accent" />
                      <h3 className="text-lg font-semibold text-foreground">Smart Action Analysis</h3>
                    </div>
                    <Button
                      onClick={generateActions}
                      disabled={isGeneratingActions}
                      className="bg-accent hover:bg-accent/90 text-accent-foreground"
                      size="sm"
                    >
                      {isGeneratingActions ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Analyzing...
                        </>
                      ) : (
                        <>
                          <Wand2 className="mr-2 h-4 w-4" />
                          Generate Actions
                        </>
                      )}
                    </Button>
                  </div>
                  
                  {currentActions.length === 0 && !isGeneratingActions ? (
                    <div className="text-center py-8">
                      <div className="text-4xl mb-4">🔍</div>
                      <p className="text-muted-foreground mb-4">Click "Generate Actions" to analyze the transcript for action items.</p>
                      <p className="text-sm text-muted-foreground">The AI will analyze the transcript content for tasks, decisions, commitments, and next steps.</p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {currentActions.length > 0 && (
                        <div className="bg-accent/10 border border-accent/20 rounded-lg p-4">
                          <h4 className="text-md font-medium text-accent mb-3 flex items-center gap-2">
                            <CheckCircle className="h-4 w-4" />
                            Detected Action Items ({currentActions.length})
                          </h4>
                          <div className="space-y-3">
                            {currentActions.map((action, index) => (
                              <div key={index} className="flex items-start gap-3 p-3 bg-background/50 rounded-lg border border-accent/10">
                                <span className="text-accent mt-1 font-bold text-lg">•</span>
                                <div className="flex-1">
                                  <p className="text-sm text-foreground leading-relaxed">{action.text}</p>
                                  <div className="flex items-center gap-2 mt-2">
                                    <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                                      {action.timestamp}
                                    </span>
                                    {action.speaker && (
                                      <span className="text-xs text-accent bg-accent/10 px-2 py-1 rounded">
                                        {action.speaker}
                                      </span>
                                    )}
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => seekToTimestamp(transcriptionLines[action.index].startTime)}
                                      className="h-6 text-xs text-primary hover:bg-primary/10"
                                    >
                                      Jump to
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </ScrollArea>
            </TabsContent>
          </div>
        </Tabs>
      </div>

      <ExportDialog
        isOpen={showExportDialog}
        onClose={() => setShowExportDialogState(false)}
        transcriptionLines={transcriptionLines}
        filename={filename}
      />
    </>
  );
};

export default TranscriptionResult;
