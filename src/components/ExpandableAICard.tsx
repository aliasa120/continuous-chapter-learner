
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Lightbulb, BookOpen, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import { useAIAnalysis, type AIAnalysis } from '../hooks/useAIAnalysis';
import { useToast } from '@/hooks/use-toast';

interface ExpandableAICardProps {
  text: string;
  variant?: 'summary' | 'explanation';
  className?: string;
}

const ExpandableAICard: React.FC<ExpandableAICardProps> = ({
  text,
  variant = 'summary',
  className = ''
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [localAnalysis, setLocalAnalysis] = useState<AIAnalysis | null>(null);
  const { generateAnalysis, isAnalyzing } = useAIAnalysis();
  const { toast } = useToast();

  const handleAnalyze = async () => {
    if (localAnalysis) {
      setIsExpanded(!isExpanded);
      return;
    }

    try {
      const result = await generateAnalysis(text);
      setLocalAnalysis(result);
      setIsExpanded(true);
      toast({
        title: "Analysis Complete",
        description: "AI insights have been generated.",
      });
    } catch (error) {
      toast({
        title: "Analysis failed",
        description: "Unable to generate AI analysis. Please try again.",
        variant: "destructive",
      });
    }
  };

  const icon = variant === 'summary' ? BookOpen : Lightbulb;
  const IconComponent = icon;
  const title = variant === 'summary' ? 'Summary' : 'Explanation';

  return (
    <div className={className}>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleAnalyze}
        disabled={isAnalyzing}
        className="h-6 w-6 p-0 rounded-full hover:bg-green-100"
      >
        {isAnalyzing ? (
          <Loader2 className="h-3 w-3 animate-spin" />
        ) : (
          <IconComponent className="h-3 w-3" />
        )}
      </Button>

      {isExpanded && localAnalysis && (
        <Card className="mt-2 border-green-200 bg-green-50">
          <CardContent className="p-3">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-semibold text-green-700 flex items-center">
                <IconComponent className="h-3 w-3 mr-1" />
                {title}
              </h4>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(false)}
                className="h-5 w-5 p-0"
              >
                <ChevronUp className="h-3 w-3" />
              </Button>
            </div>
            
            <div className="space-y-2">
              {variant === 'summary' && (
                <p className="text-sm text-gray-700 leading-relaxed">
                  {localAnalysis.summary}
                </p>
              )}
              
              {variant === 'explanation' && (
                <p className="text-sm text-gray-700 leading-relaxed">
                  {localAnalysis.explanation}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ExpandableAICard;
