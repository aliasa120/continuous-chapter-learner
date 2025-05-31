
import React from 'react';
import { Input } from '@/components/ui/input';
import { Key } from 'lucide-react';

interface ApiKeyInputProps {
  apiKey: string;
  setApiKey: React.Dispatch<React.SetStateAction<string>>;
}

const ApiKeyInput: React.FC<ApiKeyInputProps> = ({ apiKey, setApiKey }) => {
  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium mb-1 text-green-100">
        Google Gemini API Key
      </label>
      <div className="relative">
        <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-200" />
        <Input
          type="password"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder="Enter your Gemini API key"
          className="pl-10 bg-white/10 border-green-300 focus:ring-green-400 focus:border-green-400 text-white placeholder:text-green-200"
        />
      </div>
      <p className="text-xs text-green-200">
        Get your API key from Google AI Studio
      </p>
    </div>
  );
};

export default ApiKeyInput;
