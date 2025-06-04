
import { apiRateLimit } from './apiRateLimit';

interface AnalysisOptions {
  text: string;
  type: 'explanation' | 'summary';
}

export const analyzeText = async ({ text, type }: AnalysisOptions): Promise<string> => {
  const apiKey = apiRateLimit.getAvailableApiKey();
  
  if (!apiKey) {
    throw new Error('API rate limit exceeded. Please try again in a minute.');
  }

  const prompt = type === 'explanation' 
    ? `Explain this text in simple terms, providing context and clarification: "${text}"`
    : `Provide a concise summary of this text: "${text}"`;

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: type === 'summary' ? 200 : 400,
        }
      })
    });

    if (!response.ok) {
      throw new Error(`AI analysis failed: ${response.statusText}`);
    }

    const data = await response.json();
    apiRateLimit.incrementUsage();
    
    return data.candidates?.[0]?.content?.parts?.[0]?.text || 'Analysis not available';
  } catch (error) {
    console.error('AI analysis error:', error);
    throw error;
  }
};
