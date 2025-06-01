import React, { useState, useRef } from 'react';
import FileUpload from '../components/FileUpload';
import LanguageSelector from '../components/LanguageSelector';
import TranscriptionResult from '../components/TranscriptionResult';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { transcribeWithGroqAndGemini, type TranscriptionLine } from '../utils/groqGeminiTranscription';
import { Sparkles } from 'lucide-react';

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
      const lines = await transcribeWithGroqAndGemini({
        file,
        language
      });
      
      setTranscriptionLines(lines);
      
      toast({
        title: "Transcription complete!",
        description: `Successfully transcribed ${lines.length} segments.`,
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
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white py-4 sm:py-12">
      <div className="container mx-auto px-4">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-6 sm:mb-8 text-center bg-gradient-to-r from-green-600 to-emerald-500 bg-clip-text text-transparent">
          AI-Powered Audio & Video Transcription
        </h1>

        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">
            {/* Transcription Wizard Card */}
            <div className="w-full lg:w-1/2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg text-white p-4 sm:p-6 transform transition-all hover:-translate-y-1 hover:shadow-xl">
              <div className="flex items-center mb-4">
                <div className="bg-white/20 p-2 rounded-lg mr-3">
                  <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-white" /> 
                </div>
                <h2 className="text-lg sm:text-xl font-bold">
                  Smart Transcription
                </h2>
              </div>
              <p className="mb-4 sm:mb-6 text-green-50 text-sm sm:text-base">
                Upload your audio or video files and get accurate transcriptions with speaker identification and precise timing.
              </p>
              
              <div className="space-y-4 sm:space-y-6">
                <div>
                  <label className="block text-sm font-medium text-green-50 mb-1">
                    Upload Media File
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
                      Processing...
                    </span> : 
                    <span className="flex items-center text-sm sm:text-base">
                      <Sparkles className="mr-2 h-4 w-4" />
                      Start Transcription
                    </span>
                  }
                </Button>
              </div>
            </div>
            
            {/* Results Card */}
            <div className="w-full lg:w-1/2 bg-white rounded-xl shadow-lg border border-green-100 transform transition-all hover:shadow-xl">
              <div className="p-4 sm:p-6 border-b border-green-100 bg-green-50">
                <h2 className="text-lg sm:text-xl font-bold text-green-800 flex items-center">
                  <Sparkles className="mr-2 h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                  Transcription Results
                </h2>
                {duration > 0 && (
                  <p className="text-sm text-green-600 mt-1">
                    Media Duration: {Math.floor(duration / 60)}:{String(Math.floor(duration % 60)).padStart(2, '0')}
                  </p>
                )}
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
            Supports MP3, WAV, MP4, MOV files up to 100MB • Advanced AI Processing
          </div>
        </div>
      </div>
      
      {renderMediaElement()}
    </div>
  );
};

export default Index;
