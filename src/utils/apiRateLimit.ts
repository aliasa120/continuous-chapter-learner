
interface ApiKeyInfo {
  key: string;
  dailyCount: number;
  minuteCount: number;
  lastResetTime: number;
  lastMinuteReset: number;
}

class ApiRateLimit {
  private apiKeys: ApiKeyInfo[] = [
    {
      key: "AIzaSyDwugyXtupZCo4r4urEKFX0DyE1fFqzgMY",
      dailyCount: 0,
      minuteCount: 0,
      lastResetTime: Date.now(),
      lastMinuteReset: Date.now()
    },
    {
      key: "AIzaSyA9NFN90Hs9zSm3SO-xWhoN03bnfTx8tfo",
      dailyCount: 0,
      minuteCount: 0,
      lastResetTime: Date.now(),
      lastMinuteReset: Date.now()
    }
  ];

  private currentKeyIndex = 0;
  private readonly DAILY_LIMIT = 500;
  private readonly MINUTE_LIMIT = 10;

  constructor() {
    // Load from localStorage if available
    const saved = localStorage.getItem('apiRateLimit');
    if (saved) {
      try {
        this.apiKeys = JSON.parse(saved);
      } catch (e) {
        console.error('Failed to load rate limit data:', e);
      }
    }
  }

  private saveToStorage() {
    localStorage.setItem('apiRateLimit', JSON.stringify(this.apiKeys));
  }

  private resetCountsIfNeeded(apiKey: ApiKeyInfo) {
    const now = Date.now();
    
    // Reset daily count if 24 hours passed
    if (now - apiKey.lastResetTime > 24 * 60 * 60 * 1000) {
      apiKey.dailyCount = 0;
      apiKey.lastResetTime = now;
    }
    
    // Reset minute count if 1 minute passed
    if (now - apiKey.lastMinuteReset > 60 * 1000) {
      apiKey.minuteCount = 0;
      apiKey.lastMinuteReset = now;
    }
  }

  getAvailableApiKey(): string | null {
    // Check all keys starting from current index
    for (let i = 0; i < this.apiKeys.length; i++) {
      const keyIndex = (this.currentKeyIndex + i) % this.apiKeys.length;
      const apiKey = this.apiKeys[keyIndex];
      
      this.resetCountsIfNeeded(apiKey);
      
      if (apiKey.dailyCount < this.DAILY_LIMIT && apiKey.minuteCount < this.MINUTE_LIMIT) {
        this.currentKeyIndex = keyIndex;
        return apiKey.key;
      }
    }
    
    return null; // All keys exhausted
  }

  incrementUsage() {
    const currentKey = this.apiKeys[this.currentKeyIndex];
    currentKey.dailyCount++;
    currentKey.minuteCount++;
    this.saveToStorage();
    
    // Move to next key if current one hits minute limit
    if (currentKey.minuteCount >= this.MINUTE_LIMIT) {
      this.currentKeyIndex = (this.currentKeyIndex + 1) % this.apiKeys.length;
    }
  }

  getRemainingRequests(): { daily: number; minute: number } {
    const currentKey = this.apiKeys[this.currentKeyIndex];
    this.resetCountsIfNeeded(currentKey);
    
    return {
      daily: this.DAILY_LIMIT - currentKey.dailyCount,
      minute: this.MINUTE_LIMIT - currentKey.minuteCount
    };
  }

  getTimeUntilReset(): { dailyReset: number; minuteReset: number } {
    const currentKey = this.apiKeys[this.currentKeyIndex];
    const now = Date.now();
    
    return {
      dailyReset: 24 * 60 * 60 * 1000 - (now - currentKey.lastResetTime),
      minuteReset: 60 * 1000 - (now - currentKey.lastMinuteReset)
    };
  }
}

export const apiRateLimit = new ApiRateLimit();
