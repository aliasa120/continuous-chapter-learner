
import React, { useState, useRef } from 'react';
import FileUpload from '../components/FileUpload';
import LanguageSelector from '../components/LanguageSelector';
import TranscriptionResult from '../components/TranscriptionResult';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { FileAudio, Sparkles, Wand2 } from 'lucide-react';
import { transcribeWithGemini } from '../utils/geminiTranscription';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Play, Upload, Zap, Globe, MessageSquare, Brain } from "lucide-react";
import { Link } from "react-router-dom";
import { TranscriptionLine } from '../types/transcription';

const Index = () => {
  const [file, setFile] = useState<File | null>(null);
  const [language, setLanguage] = useState("en");
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcriptionLines, setTranscriptionLines] = useState<TranscriptionLine[]>([]);
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

    setIsTranscribing(true);
    setTranscriptionLines([]);
    
    try {
      const lines = await transcribeWithGemini({
        file,
        language
      });
      
      setTranscriptionLines(lines);
      
      toast({
        title: "Transcription complete!",
        description: `Successfully transcribed ${lines.length} segments with speaker identification.`,
      });
    } catch (error) {
      console.error('Transcription failed:', error);
      toast({
        title: "Transcription failed",
        description: error instanceof Error ? error.message : "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsTranscribing(false);
    }
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
        setIsPlaying(false);
      } else {
        media.play();
        setIsPlaying(true);
      }
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

  // Determine if we need to render audio or video element
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
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
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
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
        />
      );
    }
    
    return null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 py-4 sm:py-12">
      <div className="container mx-auto px-4">
        {/* Hero Section */}
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-green-600 to-emerald-500 bg-clip-text text-transparent">
            AI Transcription Studio
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto mb-6 sm:mb-8">
            Transform your audio and video content into accurate transcriptions with speaker identification and multi-language support
          </p>
        </div>

        {/* Main Content */}
        <div className="max-w-6xl mx-auto">
          {/* Responsive layout - stack on mobile, side by side on desktop */}
          <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 mb-8 sm:mb-12">
            {/* Transcription Wizard Card */}
            <div className="w-full lg:w-1/2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg text-white p-4 sm:p-6 transform transition-all hover:-translate-y-1 hover:shadow-xl">
              <div className="flex items-center mb-4">
                <div className="bg-white/20 p-2 rounded-lg mr-3">
                  <Wand2 className="h-4 w-4 sm:h-5 sm:w-5 text-white" /> 
                </div>
                <h2 className="text-lg sm:text-xl font-bold">
                  Transcription Wizard
                </h2>
              </div>
              <p className="mb-4 sm:mb-6 text-green-50 text-sm sm:text-base">
                Upload your audio or video file, configure settings, and let our AI transcribe with speaker identification.
              </p>
              
              <div className="space-y-4 sm:space-y-6">
                <div>
                  <label className="block text-sm font-medium text-green-50 mb-1">
                    Upload File
                  </label>
                  <FileUpload file={file} setFile={setFile} />
                </div>
                
                <LanguageSelector language={language} setLanguage={setLanguage} />
                
                <Button 
                  onClick={handleTranscribe} 
                  disabled={!file || isTranscribing}
                  className="w-full bg-white text-green-700 hover:bg-green-50 h-10 sm:h-11"
                >
                  {isTranscribing ? 
                    <span className="flex items-center text-sm sm:text-base">
                      <div className="w-4 h-4 border-2 border-t-transparent border-green-700 rounded-full animate-spin mr-2"></div>
                      Transcribing...
                    </span> : 
                    <span className="flex items-center text-sm sm:text-base">
                      <Sparkles className="mr-2 h-4 w-4" />
                      Start Transcription
                    </span>
                  }
                </Button>
              </div>
            </div>
            
            {/* Transcription Results Card */}
            <div className="w-full lg:w-1/2 bg-white rounded-xl shadow-lg border border-green-100 transform transition-all hover:shadow-xl">
              <div className="p-4 sm:p-6 border-b border-green-100 bg-green-50">
                <h2 className="text-lg sm:text-xl font-bold text-green-800 flex items-center">
                  <Sparkles className="mr-2 h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                  Transcription Results
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
          
          <div className="mt-4 sm:mt-6 text-center text-xs sm:text-sm text-gray-500 bg-green-50 p-3 sm:p-4 rounded-lg border border-green-100">
            Supports MP3, WAV, MP4, MOV files up to 100MB • Powered by Google Gemini 2.5 Flash
          </div>
        </div>

        {/* Features Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 mb-8 sm:mb-12">
          <div className="bg-white p-6 sm:p-8 rounded-xl sm:rounded-2xl shadow-lg border border-green-100 transform transition-all hover:-translate-y-1 hover:shadow-xl">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
              <FileAudio className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" />
            </div>
            <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3 text-center text-gray-900">Speaker Recognition</h3>
            <p className="text-sm sm:text-base text-gray-600 text-center">
              Automatically identifies and labels different speakers in your audio content for better organization.
            </p>
          </div>
          
          <div className="bg-white p-6 sm:p-8 rounded-xl sm:rounded-2xl shadow-lg border border-green-100 transform transition-all hover:-translate-y-1 hover:shadow-xl">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
              </svg>
            </div>
            <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3 text-center text-gray-900">80+ Languages</h3>
            <p className="text-sm sm:text-base text-gray-600 text-center">
              Support for over 80 languages with automatic translation to your preferred language.
            </p>
          </div>
          
          <div className="bg-white p-6 sm:p-8 rounded-xl sm:rounded-2xl shadow-lg border border-green-100 transform transition-all hover:-translate-y-1 hover:shadow-xl">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
              <Sparkles className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" />
            </div>
            <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3 text-center text-gray-900">AI-Powered</h3>
            <p className="text-sm sm:text-base text-gray-600 text-center">
              Powered by Google's advanced Gemini AI for accurate transcription and intelligent content analysis.
            </p>
          </div>
        </div>
      </div>
      
      {renderMediaElement()}
    </div>
  );
};

export default Index;
