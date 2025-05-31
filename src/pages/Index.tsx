
import React, { useState, useRef } from 'react';
import FileUpload from '../components/FileUpload';
import LanguageSelector from '../components/LanguageSelector';
import TranscriptionResult from '../components/TranscriptionResult';
import ApiKeyInput from '../components/ApiKeyInput';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { FileAudio, Sparkles, Wand2 } from 'lucide-react';
import { transcribeWithGemini, parseTranscriptionToLines } from '../utils/geminiTranscription';
import type { TranscriptionLine } from '../pages/TranscribePage';

const Index = () => {
  const [file, setFile] = useState<File | null>(null);
  const [language, setLanguage] = useState("en");
  const [apiKey, setApiKey] = useState("AIzaSyDcvqkBlNTX1mhT6y7e-BK6Ix-AdCbR95A");
  const [transcriptionLines, setTranscriptionLines] = useState<TranscriptionLine[]>([]);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const { toast } = useToast();

  const handleTranscribe = async () => {
    if (!file) {
      toast({
        title: "No file selected",
        description: "Please upload an audio or video file first.",
        variant: "destructive",
      });
      return;
    }

    if (!apiKey.trim()) {
      toast({
        title: "API Key required",
        description: "Please enter your Google Gemini API key.",
        variant: "destructive",
      });
      return;
    }

    setIsTranscribing(true);
    setTranscriptionLines([]);
    
    try {
      const transcriptionText = await transcribeWithGemini({
        file,
        language,
        apiKey: apiKey.trim()
      });
      
      const lines = parseTranscriptionToLines(transcriptionText);
      setTranscriptionLines(lines);
      
      toast({
        title: "Transcription complete!",
        description: "Your transcription has been generated successfully.",
      });
    } catch (error) {
      console.error('Transcription error:', error);
      toast({
        title: "Transcription failed",
        description: "There was an error processing your file. Please check your API key and try again.",
        variant: "destructive",
      });
    } finally {
      setIsTranscribing(false);
    }
  };

  const handleClear = () => {
    setFile(null);
    setTranscriptionLines([]);
  };

  const handleTimeUpdate = () => {
    const media = audioRef.current || videoRef.current;
    if (media) {
      setCurrentTime(media.currentTime);
    }
  };

  const handlePlayPause = () => {
    const media = audioRef.current || videoRef.current;
    if (media) {
      if (isPlaying) {
        media.pause();
      } else {
        media.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const seekToTimestamp = (seconds: number) => {
    const media = audioRef.current || videoRef.current;
    if (media) {
      media.currentTime = seconds;
      if (!isPlaying) {
        media.play();
        setIsPlaying(true);
      }
    }
  };

  // Render media element based on file type
  const renderMediaElement = () => {
    if (!file) return null;

    const url = URL.createObjectURL(file);
    
    if (file.type.startsWith('audio/')) {
      return (
        <audio 
          ref={audioRef} 
          src={url} 
          className="hidden" 
          onTimeUpdate={handleTimeUpdate}
          onEnded={() => setIsPlaying(false)}
        />
      );
    } else if (file.type.startsWith('video/')) {
      return (
        <video 
          ref={videoRef} 
          src={url} 
          className="hidden" 
          onTimeUpdate={handleTimeUpdate}
          onEnded={() => setIsPlaying(false)}
        />
      );
    }
    
    return null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white">
      <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-12">
        {/* Hero Section - Mobile Optimized */}
        <div className="text-center mb-8 sm:mb-16">
          <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold mb-3 sm:mb-4 bg-gradient-to-r from-green-600 to-emerald-500 bg-clip-text text-transparent leading-tight">
            Audio & Video Transcriber
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-2xl mx-auto px-2">
            Convert your audio and video files to text with Google Gemini AI. Fast, accurate, and available in 80+ languages.
          </p>
        </div>
        
        {/* Main Content - Mobile First Design */}
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col lg:grid lg:grid-cols-2 gap-4 sm:gap-6">
            {/* Upload Card */}
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg overflow-hidden border border-green-100 order-1">
              <div className="bg-gradient-to-r from-green-500 to-emerald-500 py-3 sm:py-4 px-4 sm:px-6">
                <h2 className="text-lg sm:text-2xl font-semibold text-white flex items-center">
                  <Wand2 className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                  Upload Media
                </h2>
              </div>
              <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                <FileUpload file={file} setFile={setFile} />
                <LanguageSelector language={language} setLanguage={setLanguage} />
                <ApiKeyInput apiKey={apiKey} setApiKey={setApiKey} />
                
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                  <Button 
                    onClick={handleTranscribe} 
                    disabled={!file || isTranscribing || !apiKey.trim()}
                    className="w-full sm:flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 shadow-md hover:shadow-lg transition-all h-11 sm:h-10"
                  >
                    {isTranscribing ? (
                      <span className="flex items-center justify-center">
                        <div className="w-4 h-4 border-2 border-t-transparent border-white rounded-full animate-spin mr-2"></div>
                        Transcribing...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center">
                        <Sparkles className="mr-2 h-4 w-4" />
                        Transcribe Now
                      </span>
                    )}
                  </Button>
                  
                  {file && (
                    <Button 
                      variant="outline" 
                      onClick={handleClear}
                      className="w-full sm:w-auto border-green-200 hover:bg-green-50 text-green-700 h-11 sm:h-10"
                    >
                      Clear
                    </Button>
                  )}
                </div>
              </div>
            </div>
            
            {/* Results Card */}
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg overflow-hidden border border-green-100 order-2">
              <div className="bg-gradient-to-r from-green-500 to-emerald-500 py-3 sm:py-4 px-4 sm:px-6">
                <h2 className="text-lg sm:text-2xl font-semibold text-white flex items-center">
                  <FileAudio className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                  Transcription Result
                </h2>
              </div>
              <TranscriptionResult 
                transcriptionLines={transcriptionLines}
                isTranscribing={isTranscribing}
                currentTime={currentTime}
                seekToTimestamp={seekToTimestamp}
                isPlaying={isPlaying}
                onPlayPause={handlePlayPause}
              />
            </div>
          </div>
          
          {/* Info Card - Mobile Optimized */}
          <div className="bg-green-50 p-4 sm:p-6 rounded-xl mt-4 sm:mt-6 border border-green-100 shadow-sm">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between text-sm text-gray-600 space-y-2 sm:space-y-0">
              <p>Upload MP3, WAV, MP4, or MOV files up to 100MB</p>
              <p className="text-xs sm:text-sm">Powered by Google Gemini AI</p>
            </div>
          </div>
        </div>
        
        {renderMediaElement()}
        
        {/* Features - Mobile Optimized */}
        <div className="mt-12 sm:mt-20 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          <div className="bg-white p-6 sm:p-8 rounded-xl sm:rounded-2xl shadow-lg border border-green-100 transform transition-all hover:-translate-y-1 hover:shadow-xl">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
              <Sparkles className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" />
            </div>
            <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3 text-center text-gray-900">AI-Powered</h3>
            <p className="text-gray-600 text-center text-sm sm:text-base">Advanced Google Gemini AI for accurate speech recognition and transcription.</p>
          </div>
          
          <div className="bg-white p-6 sm:p-8 rounded-xl sm:rounded-2xl shadow-lg border border-green-100 transform transition-all hover:-translate-y-1 hover:shadow-xl">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
              </svg>
            </div>
            <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3 text-center text-gray-900">80+ Languages</h3>
            <p className="text-gray-600 text-center text-sm sm:text-base">Support for over 80 languages to transcribe content from around the world.</p>
          </div>
          
          <div className="bg-white p-6 sm:p-8 rounded-xl sm:rounded-2xl shadow-lg border border-green-100 transform transition-all hover:-translate-y-1 hover:shadow-xl sm:col-span-2 lg:col-span-1">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3 text-center text-gray-900">Mobile Optimized</h3>
            <p className="text-gray-600 text-center text-sm sm:text-base">Designed for mobile devices with responsive interface and touch-friendly controls.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
