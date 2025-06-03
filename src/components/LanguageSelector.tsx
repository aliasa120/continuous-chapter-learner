
import React, { useState, useRef, useEffect } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Globe, Search } from 'lucide-react';

interface LanguageSelectorProps {
  language: string;
  setLanguage: React.Dispatch<React.SetStateAction<string>>;
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({ language, setLanguage }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const languages = [
    { value: "en", label: "English" },
    { value: "ur", label: "Urdu" },
    { value: "hi", label: "Hindi" },
    { value: "ar", label: "Arabic" },
    { value: "bn", label: "Bengali" },
    { value: "af", label: "Afrikaans" },
    { value: "sq", label: "Albanian" },
    { value: "am", label: "Amharic" },
    { value: "hy", label: "Armenian" },
    { value: "as", label: "Assamese" },
    { value: "az", label: "Azerbaijani" },
    { value: "eu", label: "Basque" },
    { value: "be", label: "Belarusian" },
    { value: "bs", label: "Bosnian" },
    { value: "bg", label: "Bulgarian" },
    { value: "ca", label: "Catalan" },
    { value: "ceb", label: "Cebuano" },
    { value: "zh", label: "Chinese" },
    { value: "co", label: "Corsican" },
    { value: "hr", label: "Croatian" },
    { value: "cs", label: "Czech" },
    { value: "da", label: "Danish" },
    { value: "nl", label: "Dutch" },
    { value: "eo", label: "Esperanto" },
    { value: "et", label: "Estonian" },
    { value: "fil", label: "Filipino" },
    { value: "fi", label: "Finnish" },
    { value: "fr", label: "French" },
    { value: "fy", label: "Frisian" },
    { value: "gl", label: "Galician" },
    { value: "ka", label: "Georgian" },
    { value: "de", label: "German" },
    { value: "el", label: "Greek" },
    { value: "gu", label: "Gujarati" },
    { value: "ht", label: "Haitian Creole" },
    { value: "ha", label: "Hausa" },
    { value: "haw", label: "Hawaiian" },
    { value: "he", label: "Hebrew" },
    { value: "hmn", label: "Hmong" },
    { value: "hu", label: "Hungarian" },
    { value: "is", label: "Icelandic" },
    { value: "ig", label: "Igbo" },
    { value: "id", label: "Indonesian" },
    { value: "ga", label: "Irish" },
    { value: "it", label: "Italian" },
    { value: "ja", label: "Japanese" },
    { value: "jv", label: "Javanese" },
    { value: "kn", label: "Kannada" },
    { value: "kk", label: "Kazakh" },
    { value: "km", label: "Khmer" },
    { value: "ko", label: "Korean" },
    { value: "kri", label: "Krio" },
    { value: "ku", label: "Kurdish" },
    { value: "ky", label: "Kyrgyz" },
    { value: "lo", label: "Lao" },
    { value: "la", label: "Latin" },
    { value: "lv", label: "Latvian" },
    { value: "lt", label: "Lithuanian" },
    { value: "lb", label: "Luxembourgish" },
    { value: "mk", label: "Macedonian" },
    { value: "mg", label: "Malagasy" },
    { value: "ms", label: "Malay" },
    { value: "ml", label: "Malayalam" },
    { value: "mt", label: "Maltese" },
    { value: "mi", label: "Maori" },
    { value: "mr", label: "Marathi" },
    { value: "mni-Mtei", label: "Meiteilon (Manipuri)" },
    { value: "mn", label: "Mongolian" },
    { value: "my", label: "Myanmar (Burmese)" },
    { value: "ne", label: "Nepali" },
    { value: "no", label: "Norwegian" },
    { value: "ny", label: "Nyanja (Chichewa)" },
    { value: "or", label: "Odia (Oriya)" },
    { value: "ps", label: "Pashto" },
    { value: "fa", label: "Persian" },
    { value: "pl", label: "Polish" },
    { value: "pt", label: "Portuguese" },
    { value: "pa", label: "Punjabi" },
    { value: "ro", label: "Romanian" },
    { value: "ru", label: "Russian" },
    { value: "sm", label: "Samoan" },
    { value: "gd", label: "Scots Gaelic" },
    { value: "sr", label: "Serbian" },
    { value: "st", label: "Sesotho" },
    { value: "sn", label: "Shona" },
    { value: "sd", label: "Sindhi" },
    { value: "si", label: "Sinhala" },
    { value: "sk", label: "Slovak" },
    { value: "sl", label: "Slovenian" },
    { value: "so", label: "Somali" },
    { value: "es", label: "Spanish" },
    { value: "su", label: "Sundanese" },
    { value: "sw", label: "Swahili" },
    { value: "sv", label: "Swedish" },
    { value: "tg", label: "Tajik" },
    { value: "ta", label: "Tamil" },
    { value: "te", label: "Telugu" },
    { value: "th", label: "Thai" },
    { value: "tr", label: "Turkish" },
    { value: "uk", label: "Ukrainian" },
  ];

  // Filter languages based on search term
  const filteredLanguages = languages.filter(lang =>
    lang.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lang.value.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedLanguage = languages.find(lang => lang.value === language);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      // Small delay to ensure the element is rendered
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  // Handle search input changes - prevent event bubbling
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    e.preventDefault();
    setSearchTerm(e.target.value);
  };

  // Handle search input key events - prevent dropdown interference
  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    e.stopPropagation();
    // Only allow typing characters and navigation
    if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  // Handle input focus - maintain focus
  const handleSearchFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.stopPropagation();
    e.preventDefault();
  };

  // Handle input click - prevent dropdown close
  const handleSearchClick = (e: React.MouseEvent<HTMLInputElement>) => {
    e.stopPropagation();
    e.preventDefault();
  };

  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium mb-1 text-green-100">
        Transcribe to Language
      </label>
      <div className="relative">
        <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-200 z-10" />
        <Select 
          value={language} 
          onValueChange={setLanguage}
          onOpenChange={setIsOpen}
        >
          <SelectTrigger className="w-full pl-10 bg-white/10 border-green-300 focus:ring-green-400 focus:border-green-400 text-white placeholder:text-green-200">
            <SelectValue placeholder="Select language">
              {selectedLanguage?.label || "Select language"}
            </SelectValue>
          </SelectTrigger>
          <SelectContent className="bg-white border-gray-200 max-h-80">
            <div className="sticky top-0 z-50 bg-white border-b border-gray-200 p-2">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  ref={searchInputRef}
                  placeholder="Search languages..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  onKeyDown={handleSearchKeyDown}
                  onFocus={handleSearchFocus}
                  onClick={handleSearchClick}
                  className="pl-8 text-sm border-gray-200 focus:ring-green-400 focus:border-green-400"
                  autoComplete="off"
                  tabIndex={0}
                />
              </div>
            </div>
            <div className="max-h-60 overflow-y-auto">
              {filteredLanguages.length > 0 ? (
                filteredLanguages.map((lang) => (
                  <SelectItem 
                    key={lang.value} 
                    value={lang.value} 
                    className="hover:bg-gray-50 focus:bg-gray-50 text-gray-900"
                    onSelect={() => {
                      setSearchTerm('');
                      setIsOpen(false);
                    }}
                  >
                    {lang.label}
                  </SelectItem>
                ))
              ) : (
                <div className="p-2 text-gray-500 text-sm text-center">
                  No languages found matching "{searchTerm}"
                </div>
              )}
            </div>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default LanguageSelector;
