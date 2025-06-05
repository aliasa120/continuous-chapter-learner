
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

      const prompt = `Analyze this transcript and provide structured insights:\n\n${transcriptText}`;

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
                description: 'Concise 2-3 sentence summary of the transcript'
              },
              explanation: {
                type: 'string', 
                description: 'Detailed explanation of key points, context, and insights'
              },
              actions: {
                type: 'array',
                items: {
                  type: 'string'
                },
                description: 'Bullet points of what actions or tasks are mentioned in the content'
              }
            },
            required: ['summary', 'explanation', 'actions'],
            propertyOrdering: ['summary', 'explanation', 'actions']
          }
        }
      });

      const result = JSON.parse(response.text || '{}') as AIAnalysis;
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
