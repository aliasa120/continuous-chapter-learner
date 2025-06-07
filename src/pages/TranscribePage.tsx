import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Download, FileAudio, Loader2, CheckCircle, AlertCircle, Clock, Users } from 'lucide-react';
import FileUpload from '../components/FileUpload';
import LanguageSelector from '../components/LanguageSelector';
import VideoPlayer from '../components/VideoPlayer';
import TranscriptionResult from '../components/TranscriptionResult';
import MobileTranscriptionResult from '../components/MobileTranscriptionResult';
import { transcribeWithGemini, type TranscriptionLine } from '../utils/geminiTranscription';
import { useTranscriptionHistory } from '../hooks/useTranscriptionHistory';
import { useSettings } from '../contexts/SettingsContext';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import { useAuth } from '@/contexts/AuthContext';

const TranscribePage = () => {
  const [file, setFile] = useState<File | null>(null);
  const [language, setLanguage] = useState('en');
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcriptionLines, setTranscriptionLines] = useState<TranscriptionLine[]>([]);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [dailyCount, setDailyCount] = useState(0);
  
  const { addToHistory } = useTranscriptionHistory();
  const { autoPlay, saveTranscripts } = useSettings();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const { user, checkDailyLimit, recordTranscription } = useAuth();

  const DAILY_LIMIT = 10;

  useEffect(() => {
    if (user) {
      loadDailyCount();
    }
  }, [user]);

  const loadDailyCount = async () => {
    try {
      const count = await checkDailyLimit();
      setDailyCount(count);
    } catch (error) {
      console.error('Error loading daily count:', error);
    }
  };

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
    if (!file) {
      toast({
        title: "Missing requirements",
        description: "Please select a file to transcribe.",
        variant: "destructive",
      });
      return;
    }

    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to use the transcription service.",
        variant: "destructive",
      });
      return;
    }

    if (dailyCount >= DAILY_LIMIT) {
      toast({
        title: "Daily limit reached",
        description: `You have reached your daily limit of ${DAILY_LIMIT} transcriptions. Please try again tomorrow.`,
        variant: "destructive",
      });
      return;
    }

    setIsTranscribing(true);
    setProgress(0);
    setTranscriptionLines([]);

    try {
      const result = await transcribeWithGemini({
        file: file,
        language: language
      });
      
      setTranscriptionLines(result);
      setProgress(100);
      
      await recordTranscription(file.name);
      setDailyCount(prev => prev + 1);
      
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
    setIsPlaying(!isPlaying);
  };

  const handleRestart = () => {
    setCurrentTime(0);
  };

  const seekToTimestamp = (seconds: number) => {
    setCurrentTime(seconds);
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

  const remainingTranscriptions = DAILY_LIMIT - dailyCount;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 py-4 sm:py-6">
      <div className="container mx-auto px-3 sm:px-4 max-w-7xl">
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                AI Transcription Studio
              </h1>
              <p className="text-muted-foreground text-sm sm:text-base">Upload your audio or video file and get accurate transcriptions</p>
            </div>
            
            {user && (
              <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-secondary/5 backdrop-blur">
                <CardContent className="p-3 sm:p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium">Daily Usage</span>
                    </div>
                    <Badge 
                      variant={remainingTranscriptions > 3 ? "default" : remainingTranscriptions > 0 ? "secondary" : "destructive"}
                      className="font-semibold"
                    >
                      {dailyCount}/{DAILY_LIMIT}
                    </Badge>
                  </div>
                  <div className="mt-2">
                    <Progress 
                      value={(dailyCount / DAILY_LIMIT) * 100} 
                      className="h-2"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      {remainingTranscriptions} transcriptions remaining today
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Upload and Controls */}
          <div className="lg:col-span-1 space-y-4 sm:space-y-6">
            <Card className="border-primary/20 shadow-lg bg-card backdrop-blur">
              <CardHeader className="pb-3 sm:pb-4">
                <CardTitle className="flex items-center gap-2 text-primary text-base sm:text-lg">
                  <FileAudio className="h-4 w-4 sm:h-5 sm:w-5" />
                  Upload File
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FileUpload file={file} setFile={handleFileSelect} />
                {file && (
                  <div className="flex items-center gap-2 p-3 bg-primary/10 rounded-lg border border-primary/20">
                    <CheckCircle className="h-4 w-4 text-primary flex-shrink-0" />
                    <span className="text-sm font-medium text-foreground truncate">{file.name}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-secondary/20 shadow-lg bg-card backdrop-blur">
              <CardHeader className="pb-3 sm:pb-4">
                <CardTitle className="text-secondary text-base sm:text-lg">Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Language</label>
                  <LanguageSelector language={language} setLanguage={setLanguage} />
                </div>
              </CardContent>
            </Card>

            {/* Transcribe Button */}
            <Button
              onClick={handleTranscribe}
              disabled={!file || isTranscribing || !user || dailyCount >= DAILY_LIMIT}
              className="w-full bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white py-4 sm:py-6 text-base sm:text-lg rounded-xl shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isTranscribing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
                  Transcribing... {progress}%
                </>
              ) : dailyCount >= DAILY_LIMIT ? (
                'Daily Limit Reached'
              ) : !user ? (
                'Sign In Required'
              ) : (
                'Start Transcription'
              )}
            </Button>

            {/* Progress indicator */}
            {isTranscribing && (
              <div className="space-y-2">
                <Progress value={progress} className="h-2" />
                <p className="text-xs text-center text-muted-foreground">
                  Processing your file... This may take a few moments.
                </p>
              </div>
            )}

            {/* Player moved below transcribe button */}
            {audioUrl && (
              <VideoPlayer
                file={file}
                audioUrl={audioUrl}
                currentTime={currentTime}
                duration={duration}
                isPlaying={isPlaying}
                onTimeUpdate={setCurrentTime}
                onLoadedMetadata={setDuration}
                onEnded={() => setIsPlaying(false)}
                onPlayPause={handlePlayPause}
                onRestart={handleRestart}
                seekToTimestamp={seekToTimestamp}
                transcriptionLines={transcriptionLines}
              />
            )}

            {/* Authentication notice */}
            {!user && (
              <Card className="border-amber-200 bg-amber-50/50 dark:border-amber-800 dark:bg-amber-900/20">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                        Authentication Required
                      </p>
                      <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                        Please sign in to use the transcription service and track your daily usage.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Results */}
          <div className="lg:col-span-2">
            <Card className="border-primary/20 shadow-lg bg-card backdrop-blur">
              <CardHeader className="pb-3 sm:pb-4">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <CardTitle className="flex items-center gap-2 text-primary text-base sm:text-lg">
                    Transcription Results
                    {transcriptionLines.length > 0 && (
                      <Badge variant="secondary" className="bg-primary/10 text-primary text-xs">
                        {transcriptionLines.length} segments
                      </Badge>
                    )}
                  </CardTitle>
                  {transcriptionLines.length > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={exportTranscription}
                      className="border-secondary text-secondary hover:bg-secondary/10 text-xs sm:text-sm"
                    >
                      <Download className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
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
