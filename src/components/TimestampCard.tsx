
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Play, Pause, Square, User, Award, Clock, BookOpen, Lightbulb, Loader2, RotateCcw } from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';
import { useAIAnalysis } from '../hooks/useAIAnalysis';
import { useToast } from '@/hooks/use-toast';
import WordHighlight from './WordHighlight';
import type { TranscriptionLine } from '../utils/geminiTranscription';

interface TimestampCardProps {
  line: TranscriptionLine;
  index: number;
  isActive: boolean;
  currentTime: number;
  seekToTimestamp: (seconds: number) => void;
  isPlaying: boolean;
  globalIsPlaying: boolean;
  onGlobalPlayPause: () => void;
  language?: string;
}

const TimestampCard: React.FC<TimestampCardProps> = ({
  line,
  index,
  isActive,
  currentTime,
  seekToTimestamp,
  isPlaying,
  globalIsPlaying,
  onGlobalPlayPause,
  language = 'en'
}) => {
  const [showSummary, setShowSummary] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [summary, setSummary] = useState<string>('');
  const [explanation, setExplanation] = useState<string>('');
  const [actions, setActions] = useState<string[]>([]);
  const [isSegmentPlaying, setIsSegmentPlaying] = useState(false);
  const [segmentProgress, setSegmentProgress] = useState(0);
  const { generateAnalysis, isAnalyzing } = useAIAnalysis();
  const { showConfidence, timestampPlayerMode } = useSettings();
  const { toast } = useToast();
  const segmentTimerRef = useRef<NodeJS.Timeout | null>(null);
  const progressTimerRef = useRef<NodeJS.Timeout | null>(null);

  // RTL languages
  const rtlLanguages = ['ar', 'he', 'ur', 'fa', 'ps', 'sd'];
  const isRTL = rtlLanguages.includes(language);

  useEffect(() => {
    if (isSegmentPlaying && timestampPlayerMode === 'segment') {
      // Update progress
      progressTimerRef.current = setInterval(() => {
        const elapsed = currentTime - line.startTime;
        const duration = line.endTime - line.startTime;
        const progress = Math.min((elapsed / duration) * 100, 100);
        setSegmentProgress(progress);
        
        if (currentTime >= line.endTime) {
          handleSegmentStop();
        }
      }, 100);
    }
    
    return () => {
      if (progressTimerRef.current) {
        clearInterval(progressTimerRef.current);
      }
    };
  }, [isSegmentPlaying, currentTime, line.startTime, line.endTime, timestampPlayerMode]);

  const handleSegmentPlay = () => {
    if (timestampPlayerMode === 'segment') {
      // Stop global player if running
      if (globalIsPlaying) {
        onGlobalPlayPause();
      }
      
      // Start segment playback
      seekToTimestamp(line.startTime);
      setIsSegmentPlaying(true);
      setSegmentProgress(0);
      
      // Set timer to stop at segment end
      const duration = (line.endTime - line.startTime) * 1000;
      segmentTimerRef.current = setTimeout(() => {
        handleSegmentStop();
      }, duration);
      
    } else if (timestampPlayerMode === 'loop') {
      // Loop mode - play segment and restart
      seekToTimestamp(line.startTime);
      setIsSegmentPlaying(true);
      
      const duration = (line.endTime - line.startTime) * 1000;
      segmentTimerRef.current = setTimeout(() => {
        // Restart the segment
        setTimeout(() => handleSegmentPlay(), 500);
      }, duration);
      
    } else {
      // Regular behavior - seek and play globally
      seekToTimestamp(line.startTime);
      if (!globalIsPlaying) {
        onGlobalPlayPause();
      }
    }
  };

  const handleSegmentStop = () => {
    setIsSegmentPlaying(false);
    setSegmentProgress(0);
    if (segmentTimerRef.current) {
      clearTimeout(segmentTimerRef.current);
      segmentTimerRef.current = null;
    }
    if (progressTimerRef.current) {
      clearInterval(progressTimerRef.current);
      progressTimerRef.current = null;
    }
  };

  const handleSegmentRestart = () => {
    seekToTimestamp(line.startTime);
    setSegmentProgress(0);
  };

  const handleSummaryClick = async () => {
    if (!summary) {
      try {
        const result = await generateAnalysis(line.text);
        setSummary(result.summary);
        setExplanation(result.explanation);
        setActions(result.actions);
      } catch (error) {
        toast({
          title: "Analysis failed",
          description: "Unable to generate summary. Please try again.",
          variant: "destructive",
        });
        return;
      }
    }
    setShowSummary(!showSummary);
  };

  const handleExplanationClick = async () => {
    if (!explanation) {
      try {
        const result = await generateAnalysis(line.text);
        setSummary(result.summary);
        setExplanation(result.explanation);
        setActions(result.actions);
      } catch (error) {
        toast({
          title: "Analysis failed",
          description: "Unable to generate explanation. Please try again.",
          variant: "destructive",
        });
        return;
      }
    }
    setShowExplanation(!showExplanation);
  };

  const getConfidenceColor = (confidence?: number) => {
    if (!confidence) return 'text-muted-foreground';
    if (confidence >= 95) return 'text-green-500';
    if (confidence >= 85) return 'text-yellow-500';
    return 'text-red-500';
  };

  const isCurrentlyActive = isActive || isSegmentPlaying;

  return (
    <div 
      className={`rounded-xl border p-4 transition-all duration-300 ${
        isCurrentlyActive 
          ? 'border-primary shadow-lg bg-primary/5 ring-2 ring-primary/20 transform scale-[1.02]' 
          : 'border-border hover:border-primary/30 bg-card hover:shadow-md'
      }`}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <div className="flex flex-col">
        {/* Header Row */}
        <div className={`flex items-center justify-between mb-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <div className={`flex items-center gap-2 flex-wrap ${isRTL ? 'flex-row-reverse' : ''}`}>
            <span className="text-xs sm:text-sm font-mono text-primary bg-primary/10 px-2 py-1 rounded-lg flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {line.timestamp}
            </span>
            {line.speaker && (
              <div className="flex items-center gap-1 text-xs text-accent bg-accent/10 px-2 py-1 rounded-lg">
                <User className="h-3 w-3" />
                <span>{line.speaker}</span>
              </div>
            )}
            {line.confidence && showConfidence && (
              <div className={`flex items-center gap-1 text-xs px-2 py-1 rounded-lg ${getConfidenceColor(line.confidence)} bg-muted`}>
                <Award className="h-3 w-3" />
                <span>{line.confidence}%</span>
              </div>
            )}
          </div>
          <div className={`flex items-center gap-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
            {/* Segment Player Controls */}
            <div className={`flex items-center gap-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <Button 
                variant="outline" 
                size="sm" 
                className={`h-8 w-8 p-0 rounded-full transition-all ${
                  isCurrentlyActive 
                    ? 'text-primary border-primary bg-primary/10 shadow-sm' 
                    : 'hover:text-primary text-muted-foreground border-border'
                }`}
                onClick={handleSegmentPlay}
              >
                {isSegmentPlaying ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
              </Button>
              
              {timestampPlayerMode === 'segment' && isSegmentPlaying && (
                <>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-8 w-8 p-0 rounded-full hover:text-secondary text-muted-foreground border-border"
                    onClick={handleSegmentStop}
                  >
                    <Square className="h-3 w-3" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-8 w-8 p-0 rounded-full hover:text-accent text-muted-foreground border-border"
                    onClick={handleSegmentRestart}
                  >
                    <RotateCcw className="h-3 w-3" />
                  </Button>
                </>
              )}
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSummaryClick}
              disabled={isAnalyzing}
              className="h-8 w-8 p-0 rounded-full hover:bg-primary/10"
            >
              {isAnalyzing ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <BookOpen className="h-3 w-3" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleExplanationClick}
              disabled={isAnalyzing}
              className="h-8 w-8 p-0 rounded-full hover:bg-accent/10"
            >
              {isAnalyzing ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <Lightbulb className="h-3 w-3" />
              )}
            </Button>
          </div>
        </div>
        
        {/* Text Content with Word Highlighting */}
        <div className={`mb-3 ${isCurrentlyActive ? 'font-medium text-primary' : 'text-foreground'}`}>
          <WordHighlight
            text={line.text}
            currentTime={currentTime}
            startTime={line.startTime}
            endTime={line.endTime}
            language={language}
          />
        </div>

        {/* Summary */}
        {showSummary && summary && (
          <div className="mb-3 p-3 bg-primary/5 rounded-lg border border-primary/20">
            <h5 className="text-sm font-medium text-primary mb-2 flex items-center">
              <BookOpen className="h-3 w-3 mr-1" />
              Summary
            </h5>
            <p className="text-sm text-foreground leading-relaxed">
              {summary}
            </p>
          </div>
        )}

        {/* Explanation */}
        {showExplanation && explanation && (
          <div className="mb-3 p-3 bg-accent/5 rounded-lg border border-accent/20">
            <h5 className="text-sm font-medium text-accent mb-2 flex items-center">
              <Lightbulb className="h-3 w-3 mr-1" />
              Explanation
            </h5>
            <p className="text-sm text-foreground leading-relaxed">
              {explanation}
            </p>
          </div>
        )}

        {/* Actions */}
        {(showSummary || showExplanation) && actions.length > 0 && (
          <div className="mb-3 p-3 bg-green-500/5 rounded-lg border border-green-500/20">
            <h5 className="text-sm font-medium text-green-500 mb-2">
              Actions
            </h5>
            <ul className="space-y-1">
              {actions.slice(0, 3).map((action, index) => (
                <li key={index} className="text-xs text-foreground flex items-start">
                  <span className="text-green-500 mr-2 mt-0.5">•</span>
                  <span>{action}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        
        {/* Progress bar for active line or segment playback */}
        {(isActive || isSegmentPlaying) && (
          <div className="mt-3 bg-primary/20 rounded-full h-2 overflow-hidden">
            <div 
              className="bg-primary h-full transition-all duration-300 rounded-full"
              style={{
                width: `${isSegmentPlaying ? segmentProgress : Math.min(100, ((currentTime - line.startTime) / (line.endTime - line.startTime)) * 100)}%`
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default TimestampCard;
