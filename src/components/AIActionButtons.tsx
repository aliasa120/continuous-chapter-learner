
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import { Brain, FileText, Copy, CheckCircle, Loader2 } from 'lucide-react';
import { explainTextWithAI, summarizeTextWithAI } from '../utils/groqGeminiTranscription';
import { useToast } from '@/hooks/use-toast';

interface AIActionButtonsProps {
  text: string;
  language: string;
  onExpand?: () => void;
  isExpanded?: boolean;
  className?: string;
}

const AIActionButtons: React.FC<AIActionButtonsProps> = ({
  text,
  language,
  onExpand,
  isExpanded = false,
  className = ""
}) => {
  const [isExplaining, setIsExplaining] = useState(false);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [explanation, setExplanation] = useState<string | null>(null);
  const [summary, setSummary] = useState<string | null>(null);
  const { toast } = useToast();

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({
      title: "Copied!",
      description: "Text copied to clipboard",
    });
  };

  const handleExplain = async () => {
    if (explanation) {
      setExplanation(null);
      return;
    }

    setIsExplaining(true);
    try {
      const result = await explainTextWithAI(text, language);
      setExplanation(result);
      if (onExpand && !isExpanded) {
        onExpand();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate explanation",
        variant: "destructive",
      });
    } finally {
      setIsExplaining(false);
    }
  };

  const handleSummarize = async () => {
    if (summary) {
      setSummary(null);
      return;
    }

    setIsSummarizing(true);
    try {
      const result = await summarizeTextWithAI(text, language);
      setSummary(result);
      if (onExpand && !isExpanded) {
        onExpand();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate summary",
        variant: "destructive",
      });
    } finally {
      setIsSummarizing(false);
    }
  };

  return (
    <TooltipProvider>
      <div className={`flex flex-col gap-2 ${className}`}>
        <div className="flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-6 w-6 p-0 rounded-full"
                onClick={handleCopy}
              >
                {copied ? <CheckCircle className="h-3 w-3 text-green-600" /> : <Copy className="h-3 w-3" />}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{copied ? "Copied!" : "Copy text"}</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className={`h-6 w-6 p-0 rounded-full ${explanation ? 'bg-blue-100 border-blue-300' : ''}`}
                onClick={handleExplain}
                disabled={isExplaining}
              >
                {isExplaining ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <Brain className="h-3 w-3" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{explanation ? "Hide explanation" : "Explain with AI"}</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className={`h-6 w-6 p-0 rounded-full ${summary ? 'bg-purple-100 border-purple-300' : ''}`}
                onClick={handleSummarize}
                disabled={isSummarizing}
              >
                {isSummarizing ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <FileText className="h-3 w-3" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{summary ? "Hide summary" : "Summarize with AI"}</p>
            </TooltipContent>
          </Tooltip>
        </div>

        {explanation && (
          <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="text-xs font-semibold text-blue-800 mb-1">AI Explanation:</h4>
            <p className="text-xs text-blue-700 leading-relaxed">{explanation}</p>
          </div>
        )}

        {summary && (
          <div className="mt-2 p-2 bg-purple-50 border border-purple-200 rounded-lg">
            <h4 className="text-xs font-semibold text-purple-800 mb-1">AI Summary:</h4>
            <p className="text-xs text-purple-700 leading-relaxed">{summary}</p>
          </div>
        )}
      </div>
    </TooltipProvider>
  );
};

export default AIActionButtons;
