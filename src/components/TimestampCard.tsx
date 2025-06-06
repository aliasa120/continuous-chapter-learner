
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Play, Pause, User, Award, Clock, BookOpen, Lightbulb, Loader2 } from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';
import { useAIAnalysis } from '../hooks/useAIAnalysis';
import { useToast } from '@/hooks/use-toast';
import type { TranscriptionLine } from '../utils/geminiTranscription';

interface TimestampCardProps {
  line: TranscriptionLine;
  index: number;
  isActive: boolean;
  currentTime: number;
  seekToTimestamp: (seconds: number) => void;
  isPlaying: boolean;
}

const TimestampCard: React.FC<TimestampCardProps> = ({
  line,
  index,
  isActive,
  currentTime,
  seekToTimestamp,
  isPlaying
}) => {
  const [showSummary, setShowSummary] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [summary, setSummary] = useState<string>('');
  const [explanation, setExplanation] = useState<string>('');
  const [actions, setActions] = useState<string[]>([]);
  const { generateAnalysis, isAnalyzing } = useAIAnalysis();
  const { showConfidence } = useSettings();
  const { toast } = useToast();

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
    if (confidence >= 95) return 'text-success';
    if (confidence >= 85) return 'text-warning';
    return 'text-destructive';
  };

  return (
    <div 
      className={`rounded-xl border p-4 transition-all duration-300 ${
        isActive 
          ? 'border-primary shadow-lg bg-primary/5 ring-2 ring-primary/20 transform scale-[1.02]' 
          : 'border-border hover:border-primary/30 bg-card hover:shadow-md'
      }`}
    >
      <div className="flex flex-col">
        {/* Header Row */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 flex-wrap">
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
          <div className="flex items-center gap-1">
            <Button 
              variant="outline" 
              size="sm" 
              className={`h-8 w-8 p-0 rounded-full transition-all ${
                isActive 
                  ? 'text-primary border-primary bg-primary/10 shadow-sm' 
                  : 'hover:text-primary text-muted-foreground border-border'
              }`}
              onClick={() => seekToTimestamp(line.startTime)}
            >
              {isActive && isPlaying ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
            </Button>
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
        
        {/* Text Content */}
        <p className={`text-sm sm:text-base leading-relaxed mb-3 ${
          isActive ? 'font-medium text-primary' : 'text-foreground'
        }`}>
          {line.text}
        </p>

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
          <div className="p-3 bg-success/5 rounded-lg border border-success/20">
            <h5 className="text-sm font-medium text-success mb-2">
              Actions
            </h5>
            <ul className="space-y-1">
              {actions.slice(0, 3).map((action, index) => (
                <li key={index} className="text-xs text-foreground flex items-start">
                  <span className="text-success mr-2 mt-0.5">•</span>
                  <span>{action}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        
        {/* Progress bar for active line */}
        {isActive && (
          <div className="mt-3 bg-primary/20 rounded-full h-2 overflow-hidden">
            <div 
              className="bg-primary h-full transition-all duration-300 rounded-full"
              style={{
                width: `${Math.min(100, ((currentTime - line.startTime) / (line.endTime - line.startTime)) * 100)}%`
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default TimestampCard;
