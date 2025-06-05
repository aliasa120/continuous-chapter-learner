
import { useState } from 'react';
import { GoogleGenAI } from '@google/genai';

const HARDCODED_API_KEY = 'AIzaSyDcvqkBlNTX1mhT6y7e-BK6Ix-AdCbR95A';

export interface AIAnalysis {
  summary: string;
  explanation: string;
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

      const summaryPrompt = `Please provide a concise summary of this transcript in 2-3 sentences:\n\n${transcriptText}`;
      const explanationPrompt = `Please provide a detailed explanation of the key points, context, and insights from this transcript:\n\n${transcriptText}`;

      const [summaryResponse, explanationResponse] = await Promise.all([
        ai.models.generateContent({
          model,
          contents: [{ role: 'user', parts: [{ text: summaryPrompt }] }],
        }),
        ai.models.generateContent({
          model,
          contents: [{ role: 'user', parts: [{ text: explanationPrompt }] }],
        })
      ]);

      const summary = summaryResponse.text || 'No summary available';
      const explanation = explanationResponse.text || 'No explanation available';

      const result = { summary, explanation };
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
