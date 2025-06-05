
import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import FileUpload from '../components/FileUpload';
import LanguageSelector from '../components/LanguageSelector';
import MobileTranscriptionResult from '../components/MobileTranscriptionResult';
import MobileNavigation from '../components/MobileNavigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { transcribeWithGemini, type TranscriptionLine } from '../utils/geminiTranscription';

const TranscribePage = () => {
  const [file, setFile] = useState<File | null>(null);
  const [language, setLanguage] = useState("en");
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcriptionLines, setTranscriptionLines] = useState<TranscriptionLine[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
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
      console.log('Starting transcription with file:', file.name, 'language:', language);
      
      const results = await transcribeWithGemini({
        file,
        language
      });
      
      console.log('Transcription completed, results:', results);
      setTranscriptionLines(results);
      
      toast({
        title: "Transcription Complete!",
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
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white pb-20">
      <div className="container mx-auto px-4 py-4">
        <div className="mb-4">
          <Link to="/" className="inline-flex items-center text-green-600 hover:text-green-800 transition-colors">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to home
          </Link>
        </div>

        <h1 className="text-xl sm:text-2xl font-bold mb-6 text-center bg-gradient-to-r from-green-600 to-emerald-500 bg-clip-text text-transparent">
          AI Transcription & Translation
        </h1>

        <div className="max-w-md mx-auto space-y-4">
          {/* Mobile-optimized Upload Card */}
          <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg shadow-lg text-white p-4">
            <div className="flex items-center mb-3">
              <div className="bg-white/20 p-2 rounded-lg mr-2">
                <Sparkles className="h-4 w-4 text-white" /> 
              </div>
              <h2 className="text-lg font-bold">AI Transcription</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-green-50 mb-2">
                  Upload Media File
                </label>
                <FileUpload file={file} setFile={setFile} />
              </div>
              
              <LanguageSelector language={language} setLanguage={setLanguage} />
              
              <Button 
                onClick={handleTranscribe} 
                disabled={!file || isTranscribing}
                className="w-full bg-white text-green-700 hover:bg-green-50 h-10"
              >
                {isTranscribing ? 
                  <span className="flex items-center text-sm">
                    <div className="w-4 h-4 border-2 border-t-transparent border-green-700 rounded-full animate-spin mr-2"></div>
                    AI Processing...
                  </span> : 
                  <span className="flex items-center text-sm">
                    <Sparkles className="mr-2 h-4 w-4" />
                    Start Transcription
                  </span>
                }
              </Button>
            </div>
          </div>
          
          {/* Mobile-optimized Results */}
          <MobileTranscriptionResult
            transcriptionLines={transcriptionLines}
            isTranscribing={isTranscribing}
            currentTime={currentTime}
            seekToTimestamp={seekToTimestamp}
            isPlaying={isPlaying}
            onPlayPause={handlePlayPause}
          />
        </div>
      </div>
      
      {renderMediaElement()}
      <MobileNavigation />
    </div>
  );
};

export default TranscribePage;
