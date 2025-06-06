
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Play, Pause, User, Award, Clock, BookOpen, Lightbulb, Loader2 } from 'lucide-react';
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
    if (!confidence) return 'text-gray-500 dark:text-gray-400';
    if (confidence >= 95) return 'text-green-600 dark:text-green-400';
    if (confidence >= 85) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-500 dark:text-red-400';
  };

  return (
    <div 
      className={`rounded-lg border p-3 transition-all ${
        isActive 
          ? 'border-green-500 dark:border-green-400 shadow-md bg-green-50 dark:bg-green-900/30 ring-2 ring-green-200 dark:ring-green-700 transform scale-[1.02]' 
          : 'border-gray-200 dark:border-gray-700 hover:border-green-300 dark:hover:border-green-600 bg-white dark:bg-gray-800 hover:shadow-sm'
      }`}
    >
      <div className="flex flex-col">
        {/* Header Row */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs sm:text-sm font-mono text-green-700 dark:text-green-400 bg-green-100 dark:bg-green-900/50 px-2 py-1 rounded flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {line.timestamp}
            </span>
            {line.speaker && (
              <div className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/50 px-2 py-1 rounded">
                <User className="h-3 w-3" />
                <span>{line.speaker}</span>
              </div>
            )}
            {line.confidence && (
              <div className={`flex items-center gap-1 text-xs px-2 py-1 rounded ${getConfidenceColor(line.confidence)} bg-gray-100 dark:bg-gray-800`}>
                <Award className="h-3 w-3" />
                <span>{line.confidence}%</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-1">
            <Button 
              variant="outline" 
              size="sm" 
              className={`h-6 w-6 p-0 rounded-full ${
                isActive 
                  ? 'text-green-700 dark:text-green-400 border-green-500 dark:border-green-600 bg-green-100 dark:bg-green-900/50 shadow-sm' 
                  : 'hover:text-green-700 dark:hover:text-green-400 text-gray-500 dark:text-gray-400 border-gray-300 dark:border-gray-600'
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
              className="h-6 w-6 p-0 rounded-full hover:bg-green-100 dark:hover:bg-green-800"
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
              className="h-6 w-6 p-0 rounded-full hover:bg-green-100 dark:hover:bg-green-800"
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
        <p className={`text-gray-900 dark:text-gray-100 text-sm sm:text-base leading-relaxed mb-2 ${
          isActive ? 'font-medium text-green-900 dark:text-green-100' : ''
        }`}>
          {line.text}
        </p>

        {/* Summary */}
        {showSummary && summary && (
          <div className="mb-2 p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-200 dark:border-blue-800">
            <h5 className="text-sm font-medium text-blue-700 dark:text-blue-400 mb-2 flex items-center">
              <BookOpen className="h-3 w-3 mr-1" />
              Summary
            </h5>
            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
              {summary}
            </p>
          </div>
        )}

        {/* Explanation */}
        {showExplanation && explanation && (
          <div className="mb-2 p-3 bg-purple-50 dark:bg-purple-900/30 rounded-lg border border-purple-200 dark:border-purple-800">
            <h5 className="text-sm font-medium text-purple-700 dark:text-purple-400 mb-2 flex items-center">
              <Lightbulb className="h-3 w-3 mr-1" />
              Explanation
            </h5>
            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
              {explanation}
            </p>
          </div>
        )}

        {/* Actions */}
        {(showSummary || showExplanation) && actions.length > 0 && (
          <div className="p-3 bg-green-50 dark:bg-green-900/30 rounded-lg border border-green-200 dark:border-green-800">
            <h5 className="text-sm font-medium text-green-700 dark:text-green-400 mb-2">
              Actions
            </h5>
            <ul className="space-y-1">
              {actions.slice(0, 3).map((action, index) => (
                <li key={index} className="text-xs text-gray-700 dark:text-gray-300 flex items-start">
                  <span className="text-green-600 dark:text-green-400 mr-2 mt-0.5">•</span>
                  <span>{action}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        
        {/* Progress bar for active line */}
        {isActive && (
          <div className="mt-2 bg-green-200 dark:bg-green-700 rounded-full h-1 overflow-hidden">
            <div 
              className="bg-green-500 dark:bg-green-400 h-full transition-all duration-300"
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
