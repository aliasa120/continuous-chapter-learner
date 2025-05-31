
import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import FileUpload from '../components/FileUpload';
import LanguageSelector from '../components/LanguageSelector';
import ApiKeyInput from '../components/ApiKeyInput';
import TranscriptionResult from '../components/TranscriptionResult';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Wand2, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { transcribeWithGemini, type TranscriptionLine } from '../utils/geminiTranscription';

const TranscribePage = () => {
  const [file, setFile] = useState<File | null>(null);
  const [language, setLanguage] = useState("en");
  const [apiKey, setApiKey] = useState<string>("");
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcriptionLines, setTranscriptionLines] = useState<TranscriptionLine[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const mediaUrlRef = useRef<string | null>(null);
  const { toast } = useToast();

  // Clean up media URL when component unmounts or file changes
  useEffect(() => {
    return () => {
      if (mediaUrlRef.current) {
        URL.revokeObjectURL(mediaUrlRef.current);
      }
    };
  }, [file]);

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
      console.log('Starting transcription with file:', file.name, 'language:', language);
      
      const results = await transcribeWithGemini({
        file,
        language,
        apiKey: apiKey.trim()
      });
      
      console.log('Transcription completed, results:', results);
      setTranscriptionLines(results);
      
      toast({
        title: "Transcription complete!",
        description: `Successfully transcribed ${results.length} segments with speaker identification.`,
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
      } else {
        media.play().catch(error => {
          console.error('Error playing media:', error);
          toast({
            title: "Playback error",
            description: "Unable to play the media file.",
            variant: "destructive",
          });
        });
      }
    }
  };

  const seekToTimestamp = (seconds: number) => {
    const media = audioRef.current || videoRef.current;
    if (media) {
      media.currentTime = seconds;
      if (!isPlaying) {
        media.play().catch(error => {
          console.error('Error playing media:', error);
          toast({
            title: "Playback error",
            description: "Unable to play the media file.",
            variant: "destructive",
          });
        });
      }
    }
  };

  // Create and manage media element
  useEffect(() => {
    if (file) {
      // Clean up previous URL
      if (mediaUrlRef.current) {
        URL.revokeObjectURL(mediaUrlRef.current);
      }
      
      // Create new URL
      mediaUrlRef.current = URL.createObjectURL(file);
      
      // Reset media refs
      if (audioRef.current) {
        audioRef.current.src = '';
        audioRef.current = null;
      }
      if (videoRef.current) {
        videoRef.current.src = '';
        videoRef.current = null;
      }
      
      setIsPlaying(false);
      setCurrentTime(0);
    }
  }, [file]);

  // Render media element
  const renderMediaElement = () => {
    if (!file || !mediaUrlRef.current) return null;

    const handleLoadedData = () => {
      console.log('Media loaded successfully');
    };

    const handleError = (e: any) => {
      console.error('Media error:', e);
      toast({
        title: "Media load error",
        description: "Unable to load the media file for playback.",
        variant: "destructive",
      });
    };

    const handlePlay = () => {
      console.log('Media started playing');
      setIsPlaying(true);
    };

    const handlePause = () => {
      console.log('Media paused');
      setIsPlaying(false);
    };

    const handleEnded = () => {
      console.log('Media ended');
      setIsPlaying(false);
    };

    if (file.type.startsWith('audio/')) {
      return (
        <audio 
          ref={audioRef} 
          src={mediaUrlRef.current} 
          className="hidden" 
          onTimeUpdate={handleTimeUpdate}
          onLoadedData={handleLoadedData}
          onError={handleError}
          onPlay={handlePlay}
          onPause={handlePause}
          onEnded={handleEnded}
          preload="metadata"
        />
      );
    } else if (file.type.startsWith('video/')) {
      return (
        <video 
          ref={videoRef} 
          src={mediaUrlRef.current} 
          className="hidden" 
          onTimeUpdate={handleTimeUpdate}
          onLoadedData={handleLoadedData}
          onError={handleError}
          onPlay={handlePlay}
          onPause={handlePause}
          onEnded={handleEnded}
          preload="metadata"
        />
      );
    }
    
    return null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white py-4 sm:py-12">
      <div className="container mx-auto px-4">
        <div className="mb-4 sm:mb-8">
          <Link to="/" className="inline-flex items-center text-green-600 hover:text-green-800 transition-colors">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to home
          </Link>
        </div>

        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-6 sm:mb-8 text-center bg-gradient-to-r from-green-600 to-emerald-500 bg-clip-text text-transparent">
          AI-Powered Transcription & Translation
        </h1>

        <div className="max-w-6xl mx-auto">
          {/* Responsive layout - stack on mobile, side by side on desktop */}
          <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">
            {/* Transcription Wizard Card */}
            <div className="w-full lg:w-1/2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg text-white p-4 sm:p-6 transform transition-all hover:-translate-y-1 hover:shadow-xl">
              <div className="flex items-center mb-4">
                <div className="bg-white/20 p-2 rounded-lg mr-3">
                  <Wand2 className="h-4 w-4 sm:h-5 sm:w-5 text-white" /> 
                </div>
                <h2 className="text-lg sm:text-xl font-bold">
                  Transcription & Translation Wizard
                </h2>
              </div>
              <p className="mb-4 sm:mb-6 text-green-50 text-sm sm:text-base">
                Upload your audio or video file, select target language, and let AI transcribe with speaker identification and real-time translation.
              </p>
              
              <div className="space-y-4 sm:space-y-6">
                <div>
                  <label className="block text-sm font-medium text-green-50 mb-1">
                    Upload File
                  </label>
                  <FileUpload file={file} setFile={setFile} />
                </div>
                
                <LanguageSelector language={language} setLanguage={setLanguage} />
                
                <ApiKeyInput apiKey={apiKey} setApiKey={setApiKey} />
                
                <Button 
                  onClick={handleTranscribe} 
                  disabled={!file || !apiKey.trim() || isTranscribing}
                  className="w-full bg-white text-green-700 hover:bg-green-50 h-10 sm:h-11"
                >
                  {isTranscribing ? 
                    <span className="flex items-center text-sm sm:text-base">
                      <div className="w-4 h-4 border-2 border-t-transparent border-green-700 rounded-full animate-spin mr-2"></div>
                      Transcribing & Translating...
                    </span> : 
                    <span className="flex items-center text-sm sm:text-base">
                      <Sparkles className="mr-2 h-4 w-4" />
                      Start AI Transcription
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
                  Transcription & Translation Results
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
            Supports MP3, WAV, MP4, MOV files up to 100MB • Powered by Google Gemini Flash 2.0 Lite • Real-time Translation & Speaker Diarization
          </div>
        </div>
      </div>
      
      {renderMediaElement()}
    </div>
  );
};

export default TranscribePage;
