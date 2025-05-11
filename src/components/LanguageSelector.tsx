
import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Globe } from 'lucide-react';

interface LanguageSelectorProps {
  language: string;
  setLanguage: React.Dispatch<React.SetStateAction<string>>;
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({ language, setLanguage }) => {
  const languages = [
    { value: "english", label: "English" },
    { value: "spanish", label: "Spanish" },
    { value: "french", label: "French" },
    { value: "german", label: "German" },
    { value: "italian", label: "Italian" },
    { value: "portuguese", label: "Portuguese" },
    { value: "russian", label: "Russian" },
    { value: "japanese", label: "Japanese" },
    { value: "chinese", label: "Chinese" },
    { value: "korean", label: "Korean" },
    { value: "arabic", label: "Arabic" },
    { value: "hindi", label: "Hindi" },
  ];

  return (
    <div className="space-y-2">
      <label htmlFor="language-select" className="block text-sm font-medium text-gray-700">
        Transcribe to Language
      </label>
      <div className="relative">
        <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
        <Select value={language} onValueChange={setLanguage}>
          <SelectTrigger id="language-select" className="w-full pl-10">
            <SelectValue placeholder="Select language" />
          </SelectTrigger>
          <SelectContent>
            {languages.map((lang) => (
              <SelectItem key={lang.value} value={lang.value}>
                {lang.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default LanguageSelector;
