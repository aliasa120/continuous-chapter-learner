
import { useState } from 'react';
import { GoogleGenAI } from '@google/genai';

const HARDCODED_API_KEY = 'AIzaSyDcvqkBlNTX1mhT6y7e-BK6Ix-AdCbR95A';

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
      const ai = new GoogleGenAI({
        apiKey: HARDCODED_API_KEY,
      });

      const model = 'gemini-2.0-flash-lite';

      const prompt = `Analyze this transcript segment and provide detailed insights:

"${transcriptText}"

Please provide:
1. A concise 2-3 sentence summary
2. Detailed explanation of key points, context, and important insights
3. Specific action items, tasks, decisions, or next steps mentioned or implied

Focus on practical, actionable insights. If this appears to be from a meeting, interview, or educational content, highlight the most important takeaways and any commitments or decisions made.`;

      const response = await ai.models.generateContent({
        model,
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: 'object',
            properties: {
              summary: {
                type: 'string',
                description: 'Concise 2-3 sentence summary of the transcript segment'
              },
              explanation: {
                type: 'string', 
                description: 'Detailed explanation of key points, context, insights, and significance'
              },
              actions: {
                type: 'array',
                items: {
                  type: 'string'
                },
                description: 'Specific action items, tasks, decisions, commitments, or next steps mentioned or implied'
              }
            },
            required: ['summary', 'explanation', 'actions'],
            propertyOrdering: ['summary', 'explanation', 'actions']
          }
        }
      });

      const result = JSON.parse(response.text || '{}') as AIAnalysis;
      
      // Ensure we have meaningful actions
      if (result.actions.length === 0) {
        result.actions = ['No specific actions identified in this segment'];
      }
      
      setAnalysis(result);
      return result;
    } catch (error) {
      console.error('AI Analysis failed:', error);
      throw new Error('Failed to generate AI analysis');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return { generateAnalysis, isAnalyzing, analysis };
};
