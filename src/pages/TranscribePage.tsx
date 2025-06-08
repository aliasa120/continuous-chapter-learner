
import React, { useState, useRef } from 'react';
import FileUpload from '../components/FileUpload';
import LanguageSelector from '../components/LanguageSelector';
import TranscriptionResult from '../components/TranscriptionResult';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { FileAudio, Sparkles, Wand2, Download } from 'lucide-react';
import { transcribeWithGemini, type TranscriptionLine } from '../utils/geminiTranscription';
import { convertToSRT } from '../utils/srtConverter';

const TranscribePage = () => {
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

  const handleExport = () => {
    if (transcriptionLines.length === 0) {
      toast({
        title: "No transcription to export",
        description: "Please transcribe a file first.",
        variant: "destructive",
      });
      return;
    }

    const srtContent = convertToSRT(transcriptionLines);
    const blob = new Blob([srtContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transcription_${Date.now()}.srt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Export successful",
      description: "Transcription exported as SRT file.",
    });
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
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 py-6">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-primary flex items-center justify-center gap-2 mb-2">
            <Wand2 className="h-8 w-8" />
            AI Transcription Studio
          </h1>
          <p className="text-muted-foreground">
            Transform your audio and video content into accurate transcriptions
          </p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Upload & Settings Card */}
          <Card className="border-primary/20 shadow-lg bg-card/50 backdrop-blur">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-primary">
                <FileAudio className="h-5 w-5" />
                Upload & Configure
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FileUpload file={file} setFile={setFile} />
              <LanguageSelector language={language} setLanguage={setLanguage} />
              
              <Button 
                onClick={handleTranscribe} 
                disabled={!file || isTranscribing}
                className="w-full"
                size="lg"
              >
                {isTranscribing ? 
                  <span className="flex items-center">
                    <div className="w-4 h-4 border-2 border-t-transparent border-current rounded-full animate-spin mr-2"></div>
                    Transcribing...
                  </span> : 
                  <span className="flex items-center">
                    <Sparkles className="mr-2 h-4 w-4" />
                    Start Transcription
                  </span>
                }
              </Button>
            </CardContent>
          </Card>
          
          {/* Results & Export Card */}
          <Card className="border-primary/20 shadow-lg bg-card/50 backdrop-blur">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-primary">
                  <Sparkles className="h-5 w-5" />
                  Results & Export
                </span>
                <Button
                  onClick={handleExport}
                  disabled={transcriptionLines.length === 0}
                  variant="outline"
                  size="sm"
                  className="text-primary border-primary hover:bg-primary hover:text-primary-foreground"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export SRT
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center text-muted-foreground py-8">
                {transcriptionLines.length === 0 ? (
                  <p>Upload a file and start transcription to see results here</p>
                ) : (
                  <p>Transcription completed with {transcriptionLines.length} segments</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Transcription Results */}
        <TranscriptionResult
          transcriptionLines={transcriptionLines}
          isTranscribing={isTranscribing}
          currentTime={currentTime}
          seekToTimestamp={seekToTimestamp}
          isPlaying={isPlaying}
          onPlayPause={handlePlayPause}
        />

        {renderMediaElement()}
      </div>
    </div>
  );
};

export default TranscribePage;
