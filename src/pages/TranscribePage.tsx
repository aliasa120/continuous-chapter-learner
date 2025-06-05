import React, { useState, useRef, useEffect } from 'react';
import FileUpload from '../components/FileUpload';
import LanguageSelector from '../components/LanguageSelector';
import MobileTranscriptionResult from '../components/MobileTranscriptionResult';
import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';
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

  useEffect(() => {
    if (file) {
      if (mediaUrlRef.current) {
        URL.revokeObjectURL(mediaUrlRef.current);
      }
      
      mediaUrlRef.current = URL.createObjectURL(file);
      
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

  useEffect(() => {
    return () => {
      if (mediaUrlRef.current) {
        URL.revokeObjectURL(mediaUrlRef.current);
      }
    };
  }, [file]);

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
    <div className="container mx-auto px-4 py-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-bold mb-8 text-center bg-gradient-to-r from-green-600 to-emerald-500 bg-clip-text text-transparent">
          AI Transcription & Translation
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg text-white p-6 sticky top-6">
              <div className="flex items-center mb-4">
                <div className="bg-white/20 p-3 rounded-lg mr-3">
                  <Sparkles className="h-6 w-6 text-white" /> 
                </div>
                <h2 className="text-xl font-bold">AI Transcription</h2>
              </div>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-green-50 mb-3">
                    Upload Media File
                  </label>
                  <FileUpload file={file} setFile={setFile} />
                </div>
                
                <LanguageSelector language={language} setLanguage={setLanguage} />
                
                <Button 
                  onClick={handleTranscribe} 
                  disabled={!file || isTranscribing}
                  className="w-full bg-white text-green-700 hover:bg-green-50 h-12"
                  size="lg"
                >
                  {isTranscribing ? 
                    <span className="flex items-center">
                      <div className="w-5 h-5 border-2 border-t-transparent border-green-700 rounded-full animate-spin mr-3"></div>
                      AI Processing...
                    </span> : 
                    <span className="flex items-center">
                      <Sparkles className="mr-3 h-5 w-5" />
                      Start Transcription
                    </span>
                  }
                </Button>
              </div>
            </div>
          </div>
          
          <div className="lg:col-span-2">
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
      </div>
      
      {renderMediaElement()}
    </div>
  );
};

export default TranscribePage;
