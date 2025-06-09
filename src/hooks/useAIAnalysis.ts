
import { useState } from 'react';

export interface AIAnalysis {
  summary: string;
  explanation: string;
  actions: string[];
}

export const useAIAnalysis = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(null);

  const generateAnalysis = async (transcriptText: string): Promise<AIAnalysis> => {
    setIsAnalyzing(true);
    
    try {
      // Analyze transcript text directly without calling external AI
      const analysis = analyzeTranscriptText(transcriptText);
      setAnalysis(analysis);
      return analysis;
    } catch (error) {
      console.error('AI Analysis failed:', error);
      throw new Error('Failed to generate AI analysis');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const analyzeTranscriptText = (text: string): AIAnalysis => {
    const lowerText = text.toLowerCase();
    
    // Extract action items using keyword analysis
    const actionKeywords = [
      'need to', 'should', 'must', 'will', 'plan to', 'going to', 'have to',
      'action', 'task', 'todo', 'follow up', 'next step', 'assign', 'delegate',
      'schedule', 'deadline', 'due', 'complete', 'finish', 'implement',
      'create', 'build', 'develop', 'design', 'prepare', 'organize',
      'send', 'call', 'email', 'contact', 'reach out', 'notify',
      'review', 'check', 'verify', 'confirm', 'approve', 'update',
      'research', 'investigate', 'analyze', 'study', 'examine'
    ];

    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 5);
    const actions: string[] = [];
    
    sentences.forEach(sentence => {
      const sentenceLower = sentence.toLowerCase();
      if (actionKeywords.some(keyword => sentenceLower.includes(keyword))) {
        actions.push(sentence.trim());
      }
    });

    // Generate summary
    const keyPoints = sentences
      .filter(s => s.trim().length > 15)
      .slice(0, 3)
      .map(s => s.trim());
    
    const summary = keyPoints.length > 0 
      ? `Key points discussed: ${keyPoints.join('. ')}.`
      : 'This segment contains general discussion and conversation.';

    // Generate explanation
    const explanation = actions.length > 0
      ? `This segment contains actionable items and tasks. ${actions.length} potential action items were identified based on keywords and context.`
      : 'This segment appears to be informational or conversational without specific action items.';

    return {
      summary,
      explanation,
      actions: actions.length > 0 ? actions.slice(0, 5) : ['No specific actions identified in this segment']
    };
  };

  return { generateAnalysis, isAnalyzing, analysis };
};
