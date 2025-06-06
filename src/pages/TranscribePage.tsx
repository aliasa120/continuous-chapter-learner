import React, { useState, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Play, Pause, RotateCcw, Download, FileAudio, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import FileUpload from '../components/FileUpload';
import LanguageSelector from '../components/LanguageSelector';
import ApiKeyInput from '../components/ApiKeyInput';
import TranscriptionResult from '../components/TranscriptionResult';
import MobileTranscriptionResult from '../components/MobileTranscriptionResult';
import { transcribeWithGemini, type TranscriptionLine } from '../utils/geminiTranscription';
import { useTranscriptionHistory } from '../hooks/useTranscriptionHistory';
import { useSettings } from '../contexts/SettingsContext';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';

const TranscribePage = () => {
  const [file, setFile] = useState<File | null>(null);
  const [apiKey, setApiKey] = useState('');
  const [language, setLanguage] = useState('en');
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcriptionLines, setTranscriptionLines] = useState<TranscriptionLine[]>([]);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  
  const audioRef = useRef<HTMLAudioElement>(null);
  const { addToHistory } = useTranscriptionHistory();
  const { autoPlay, saveTranscripts } = useSettings();
  const { toast } = useToast();
  const isMobile = useIsMobile();

  const handleFileSelect = useCallback((selectedFile: File) => {
    setFile(selectedFile);
    setTranscriptionLines([]);
    setProgress(0);
    setCurrentTime(0);
    setDuration(0);
    setIsPlaying(false);
    
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    
    const url = URL.createObjectURL(selectedFile);
    setAudioUrl(url);
  }, [audioUrl]);

  const handleTranscribe = async () => {
    if (!file || !apiKey) {
      toast({
        title: "Missing requirements",
        description: "Please select a file and enter your API key.",
        variant: "destructive",
      });
      return;
    }

    setIsTranscribing(true);
    setProgress(0);
    setTranscriptionLines([]);

    try {
      const progressCallback = (progress: number) => {
        setProgress(progress);
      };

      const result = await transcribeWithGemini(file, apiKey, language, progressCallback);
      
      setTranscriptionLines(result);
      setProgress(100);
      
      if (saveTranscripts) {
        addToHistory({
          filename: file.name,
          transcriptionLines: result,
          timestamp: new Date().toISOString(),
          language: language,
          duration: duration
        });
      }

      toast({
        title: "Transcription completed",
        description: `Successfully transcribed ${file.name}`,
      });

      if (autoPlay && audioRef.current) {
        audioRef.current.play();
        setIsPlaying(true);
      }
    } catch (error) {
      console.error('Transcription error:', error);
      toast({
        title: "Transcription failed",
        description: error instanceof Error ? error.message : "An error occurred during transcription",
        variant: "destructive",
      });
    } finally {
      setIsTranscribing(false);
    }
  };

  const handlePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleRestart = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      setCurrentTime(0);
    }
  };

  const seekToTimestamp = (seconds: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = seconds;
      setCurrentTime(seconds);
    }
  };

  const exportTranscription = () => {
    if (transcriptionLines.length === 0) return;
    
    const text = transcriptionLines.map(line => line.text).join(' ');
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${file?.name || 'transcription'}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Export successful",
      description: "Transcription has been downloaded as a text file.",
    });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 py-6">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            AI Transcription Studio
          </h1>
          <p className="text-muted-foreground">Upload your audio or video file and get accurate transcriptions</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Upload and Controls */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="border-primary/20 shadow-lg bg-card/50 backdrop-blur">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-primary">
                  <FileAudio className="h-5 w-5" />
                  Upload File
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FileUpload file={file} setFile={setFile} />
                {file && (
                  <div className="flex items-center gap-2 p-3 bg-primary/10 rounded-lg border border-primary/20">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium text-foreground truncate">{file.name}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-secondary/20 shadow-lg bg-card/50 backdrop-blur">
              <CardHeader className="pb-4">
                <CardTitle className="text-secondary">Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Language</label>
                  <LanguageSelector language={language} setLanguage={setLanguage} />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">API Key</label>
                  <ApiKeyInput apiKey={apiKey} setApiKey={setApiKey} />
                </div>
              </CardContent>
            </Card>

            {/* Audio Player */}
            {audioUrl && (
              <Card className="border-primary/20 shadow-lg bg-card/50 backdrop-blur">
                <CardHeader className="pb-4">
                  <CardTitle className="text-primary">Audio Player</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <audio
                    ref={audioRef}
                    src={audioUrl}
                    onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
                    onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
                    onEnded={() => setIsPlaying(false)}
                    className="hidden"
                  />
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handlePlayPause}
                      className="border-primary text-primary hover:bg-primary/10"
                    >
                      {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleRestart}
                      className="border-secondary text-secondary hover:bg-secondary/10"
                    >
                      <RotateCcw className="h-4 w-4" />
                    </Button>
                    <div className="text-xs text-muted-foreground">
                      {formatTime(currentTime)} / {formatTime(duration)}
                    </div>
                  </div>
                  
                  <Progress value={(currentTime / duration) * 100} className="h-2" />
                </CardContent>
              </Card>
            )}

            {/* Transcribe Button */}
            <Button
              onClick={handleTranscribe}
              disabled={!file || !apiKey || isTranscribing}
              className="w-full bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white py-6 text-lg rounded-xl shadow-lg"
            >
              {isTranscribing ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Transcribing... {progress}%
                </>
              ) : (
                'Start Transcription'
              )}
            </Button>

            {isTranscribing && (
              <div className="space-y-2">
                <Progress value={progress} className="h-2" />
                <p className="text-xs text-center text-muted-foreground">
                  Processing your file... This may take a few moments.
                </p>
              </div>
            )}
          </div>

          {/* Results */}
          <div className="lg:col-span-2">
            <Card className="border-primary/20 shadow-lg bg-card/50 backdrop-blur">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-primary">
                    Transcription Results
                    {transcriptionLines.length > 0 && (
                      <Badge variant="secondary" className="bg-primary/10 text-primary">
                        {transcriptionLines.length} segments
                      </Badge>
                    )}
                  </CardTitle>
                  {transcriptionLines.length > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={exportTranscription}
                      className="border-secondary text-secondary hover:bg-secondary/10"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {isMobile ? (
                  <MobileTranscriptionResult
                    transcriptionLines={transcriptionLines}
                    isTranscribing={isTranscribing}
                    currentTime={currentTime}
                    seekToTimestamp={seekToTimestamp}
                    isPlaying={isPlaying}
                    onPlayPause={handlePlayPause}
                  />
                ) : (
                  <TranscriptionResult
                    transcriptionLines={transcriptionLines}
                    isTranscribing={isTranscribing}
                    currentTime={currentTime}
                    seekToTimestamp={seekToTimestamp}
                    isPlaying={isPlaying}
                    onPlayPause={handlePlayPause}
                  />
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TranscribePage;
