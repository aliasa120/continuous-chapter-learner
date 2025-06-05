
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Lightbulb, BookOpen, ChevronDown, ChevronUp, Loader2, X } from 'lucide-react';
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
        className="h-6 w-6 p-0 rounded-full hover:bg-green-100 dark:hover:bg-green-800"
      >
        {isAnalyzing ? (
          <Loader2 className="h-3 w-3 animate-spin" />
        ) : (
          <IconComponent className="h-3 w-3" />
        )}
      </Button>

      {isExpanded && localAnalysis && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end md:items-center justify-center p-4">
          <Card className="w-full max-w-4xl max-h-[80vh] bg-white dark:bg-gray-800 border-green-200 dark:border-green-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-lg font-semibold text-green-700 dark:text-green-400 flex items-center">
                  <IconComponent className="h-4 w-4 mr-2" />
                  {title}
                </h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsExpanded(false)}
                  className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto">
                <div className="space-y-3">
                  <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-3">
                    <h5 className="text-sm font-medium text-blue-700 dark:text-blue-400 mb-2 flex items-center">
                      <BookOpen className="h-3 w-3 mr-1" />
                      Summary
                    </h5>
                    <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                      {localAnalysis.summary}
                    </p>
                  </div>
                  
                  {localAnalysis.actions && localAnalysis.actions.length > 0 && (
                    <div className="bg-green-50 dark:bg-green-900/30 rounded-lg p-3">
                      <h5 className="text-sm font-medium text-green-700 dark:text-green-400 mb-2">
                        Action Items
                      </h5>
                      <ul className="space-y-1">
                        {localAnalysis.actions.slice(0, 3).map((action, index) => (
                          <li key={index} className="text-xs text-gray-700 dark:text-gray-300 flex items-start">
                            <span className="text-green-600 dark:text-green-400 mr-2 mt-0.5">•</span>
                            <span>{action}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
                
                <div className="bg-purple-50 dark:bg-purple-900/30 rounded-lg p-3">
                  <h5 className="text-sm font-medium text-purple-700 dark:text-purple-400 mb-2 flex items-center">
                    <Lightbulb className="h-3 w-3 mr-1" />
                    Detailed Explanation
                  </h5>
                  <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                    {localAnalysis.explanation}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default ExpandableAICard;
