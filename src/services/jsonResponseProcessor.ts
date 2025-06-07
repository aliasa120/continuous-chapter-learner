
// Simplified JSON response processor without the missing dependency
export interface ProcessedResponse {
  content: string;
  metadata?: Record<string, any>;
}

export class JsonResponseProcessor {
  static process(response: any): ProcessedResponse {
    if (typeof response === 'string') {
      try {
        const parsed = JSON.parse(response);
        return {
          content: parsed.content || response,
          metadata: parsed.metadata
        };
      } catch {
        return { content: response };
      }
    }
    
    return {
      content: response?.content || JSON.stringify(response),
      metadata: response?.metadata
    };
  }
}
