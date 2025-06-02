import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import FileUpload from '../components/FileUpload';
import LanguageSelector from '../components/LanguageSelector';
import TranscriptionResult from '../components/TranscriptionResult';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Wand2, Sparkles, Clock, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { transcribeWithGroqAndGemini, type TranscriptionLine } from '../utils/groqGeminiTranscription';

const TranscribePage = () => {
  const [file, setFile] = useState<File | null>(null);
  const [language, setLanguage] = useState("en");
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcriptionLines, setTranscriptionLines] = useState<TranscriptionLine[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showTimestamps, setShowTimestamps] = useState(true);
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

    setIsTranscribing(true);
    setTranscriptionLines([]);
    
    try {
      console.log('Starting cost-optimized transcription with file:', file.name, 'language:', language);
      
      const results = await transcribeWithGroqAndGemini({
        file,
        language
      });
      
      console.log('Cost-optimized transcription completed, results:', results);
      setTranscriptionLines(results);
      
      toast({
        title: "Transcription Complete!",
        description: `Successfully transcribed ${results.length} segments with advanced AI processing.`,
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

  const handleLoadedMetadata = () => {
    const media = audioRef.current || videoRef.current;
    if (media) {
      setDuration(media.duration);
      console.log('Media duration loaded:', media.duration);
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
      console.log('Seeking to:', seconds, 'seconds');
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
      setDuration(0);
    }
  }, [file]);

  // Render media element with enhanced features
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

    const commonProps = {
      src: mediaUrlRef.current,
      onTimeUpdate: handleTimeUpdate,
      onLoadedData: handleLoadedData,
      onLoadedMetadata: handleLoadedMetadata,
      onError: handleError,
      onPlay: handlePlay,
      onPause: handlePause,
      onEnded: handleEnded,
      preload: "metadata" as const
    };

    if (file.type.startsWith('audio/')) {
      return (
        <audio 
          ref={audioRef} 
          className="hidden" 
          {...commonProps}
        />
      );
    } else if (file.type.startsWith('video/')) {
      return (
        <video 
          ref={videoRef} 
          className="hidden" 
          {...commonProps}
        />
      );
    }
    
    return null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white py-2 sm:py-12">
      <div className="container mx-auto px-2 sm:px-4">
        <div className="mb-2 sm:mb-8">
          <Link to="/" className="inline-flex items-center text-green-600 hover:text-green-800 transition-colors text-sm">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to home
          </Link>
        </div>

        <h1 className="text-xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-8 text-center bg-gradient-to-r from-green-600 to-emerald-500 bg-clip-text text-transparent px-2">
          AI Transcription & Translation
        </h1>

        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-2 sm:gap-6">
            {/* Mobile-Optimized Transcription Card */}
            <div className="w-full lg:w-1/2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg sm:rounded-xl shadow-lg text-white p-3 sm:p-6 transform transition-all hover:-translate-y-1 hover:shadow-xl">
              <div className="flex items-center mb-3 sm:mb-4">
                <div className="bg-white/20 p-1.5 sm:p-2 rounded-lg mr-2 sm:mr-3">
                  <Sparkles className="h-4 w-4 text-white" /> 
                </div>
                <h2 className="text-base sm:text-xl font-bold">
                  Smart Transcription
                </h2>
              </div>
              
              {/* Mobile: Hide detailed features text */}
              <p className="mb-3 sm:mb-6 text-green-50 text-xs sm:text-base hidden sm:block">
                Advanced AI transcription with real-time translation and enhanced synchronization capabilities.
              </p>
              
              <div className="space-y-3 sm:space-y-6">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-green-50 mb-1">
                    Upload Media File
                  </label>
                  <FileUpload file={file} setFile={setFile} />
                </div>
                
                <LanguageSelector language={language} setLanguage={setLanguage} />
                
                <Button 
                  onClick={handleTranscribe} 
                  disabled={!file || isTranscribing}
                  className="w-full bg-white text-green-700 hover:bg-green-50 h-9 sm:h-11 text-sm sm:text-base"
                >
                  {isTranscribing ? 
                    <span className="flex items-center">
                      <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-t-transparent border-green-700 rounded-full animate-spin mr-2"></div>
                      Processing...
                    </span> : 
                    <span className="flex items-center">
                      <Sparkles className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                      Start Transcription
                    </span>
                  }
                </Button>
              </div>
            </div>
            
            {/* Results Card with Timestamp Toggle */}
            <div className="w-full lg:w-1/2 bg-white rounded-lg sm:rounded-xl shadow-lg border border-green-100 transform transition-all hover:shadow-xl">
              <div className="p-3 sm:p-6 border-b border-green-100 bg-green-50">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <h2 className="text-base sm:text-xl font-bold text-green-800 flex items-center">
                    <Wand2 className="mr-2 h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                    Smart Results
                  </h2>
                  
                  {/* Timestamp Toggle */}
                  <div className="flex gap-1 sm:gap-2">
                    <Button
                      variant={showTimestamps ? "default" : "outline"}
                      size="sm"
                      onClick={() => setShowTimestamps(true)}
                      className={`text-xs h-7 px-2 sm:px-3 ${showTimestamps ? 'bg-green-600 text-white' : 'text-green-600 border-green-300'}`}
                    >
                      <Clock className="h-3 w-3 mr-1" />
                      With Time
                    </Button>
                    <Button
                      variant={!showTimestamps ? "default" : "outline"}
                      size="sm"
                      onClick={() => setShowTimestamps(false)}
                      className={`text-xs h-7 px-2 sm:px-3 ${!showTimestamps ? 'bg-green-600 text-white' : 'text-green-600 border-green-300'}`}
                    >
                      <FileText className="h-3 w-3 mr-1" />
                      Essay View
                    </Button>
                  </div>
                </div>
                
                {duration > 0 && (
                  <p className="text-xs sm:text-sm text-green-600 mt-1">
                    Duration: {Math.floor(duration / 60)}:{String(Math.floor(duration % 60)).padStart(2, '0')}
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
                showTimestamps={showTimestamps}
                language={language}
              />
            </div>
          </div>
          
          <div className="mt-2 sm:mt-6 text-center text-xs text-gray-500 bg-green-50 p-2 sm:p-4 rounded-lg border border-green-100">
            🎯 Multi-language AI • AI Explanations • Precise Sync
          </div>
        </div>
      </div>
      
      {renderMediaElement()}
    </div>
  );
};

export default TranscribePage;

