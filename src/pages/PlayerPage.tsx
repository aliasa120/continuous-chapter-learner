import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Pause, RotateCcw, Volume2, X, RotateCw } from 'lucide-react';
import WordHighlight from '../components/WordHighlight';
import type { TranscriptionLine } from '../utils/geminiTranscription';

const PlayerPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [transcriptionLines, setTranscriptionLines] = useState<TranscriptionLine[]>([]);
  const [currentSubtitle, setCurrentSubtitle] = useState<string>('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLandscape, setIsLandscape] = useState(false);
  
  const mediaRef = useRef<HTMLVideoElement | HTMLAudioElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const audioUrl = searchParams.get('audioUrl');
  const isVideo = searchParams.get('isVideo') === 'true';
  const transcriptionData = searchParams.get('transcription');
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

  useEffect(() => {
    if (transcriptionData) {
      try {
        const lines = JSON.parse(decodeURIComponent(transcriptionData));
        setTranscriptionLines(lines);
      } catch (error) {
        console.error('Error parsing transcription data:', error);
      }
    }
  }, [transcriptionData]);

  useEffect(() => {
    const media = mediaRef.current;
    if (media && audioUrl) {
      media.src = audioUrl;
    }
  }, [audioUrl]);

  useEffect(() => {
    // Find current subtitle based on time
    const currentLine = transcriptionLines.find(
      line => currentTime >= line.startTime && currentTime <= line.endTime
    );
    setCurrentSubtitle(currentLine?.text || '');
  }, [currentTime, transcriptionLines]);

  // Handle orientation change
  useEffect(() => {
    const handleOrientationChange = () => {
      setIsLandscape(window.innerHeight < window.innerWidth);
    };

    window.addEventListener('orientationchange', handleOrientationChange);
    window.addEventListener('resize', handleOrientationChange);
    
    return () => {
      window.removeEventListener('orientationchange', handleOrientationChange);
      window.removeEventListener('resize', handleOrientationChange);
    };
  }, []);

  const handleTimeUpdate = (e: React.SyntheticEvent<HTMLVideoElement | HTMLAudioElement>) => {
    setCurrentTime(e.currentTarget.currentTime);
  };

  const handleLoadedMetadata = (e: React.SyntheticEvent<HTMLVideoElement | HTMLAudioElement>) => {
    setDuration(e.currentTarget.duration);
  };

  const handlePlayPause = () => {
    const media = mediaRef.current;
    if (!media) return;

    if (isPlaying) {
      media.pause();
    } else {
      media.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleRestart = () => {
    const media = mediaRef.current;
    if (media) {
      media.currentTime = 0;
      setCurrentTime(0);
    }
  };

  const toggleFullscreen = async () => {
    if (!containerRef.current) return;

    try {
      if (!isFullscreen) {
        if (containerRef.current.requestFullscreen) {
          await containerRef.current.requestFullscreen();
        }
        setIsFullscreen(true);
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        }
        setIsFullscreen(false);
      }
    } catch (error) {
      console.error('Fullscreen error:', error);
    }
  };

  const handleClose = () => {
    if (isFullscreen) {
      document.exitFullscreen?.();
    }
    navigate(-1);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Get current line for word highlighting
  const getCurrentLine = () => {
    return transcriptionLines.find(
      line => currentTime >= line.startTime && currentTime <= line.endTime
    );
  };

  const currentLine = getCurrentLine();

  if (!audioUrl) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <p>No media file provided</p>
      </div>
    );
  }

  // Mobile fullscreen layout
  if (isMobile) {
    return (
      <div 
        ref={containerRef}
        className={`min-h-screen bg-black text-white flex flex-col ${
          isLandscape ? 'landscape-mode' : ''
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-black/50 backdrop-blur">
          <Button
            variant="ghost"
            onClick={handleClose}
            className="text-white hover:bg-white/20"
          >
            <X className="h-5 w-5" />
          </Button>
          <div className="flex gap-2">
            {isMobile && (
              <Button
                variant="ghost"
                onClick={toggleFullscreen}
                className="text-white hover:bg-white/20"
              >
                <RotateCw className="h-5 w-5" />
              </Button>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className={`flex-1 flex ${isLandscape ? 'flex-row' : 'flex-col'} items-center justify-center p-4`}>
          {isVideo ? (
            <div className={`relative ${isLandscape ? 'w-2/3 h-full' : 'w-full max-w-4xl'}`}>
              <video
                ref={mediaRef as React.RefObject<HTMLVideoElement>}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onEnded={() => setIsPlaying(false)}
                className="w-full h-auto rounded-lg"
                controls={false}
              />
              {/* Video Subtitles with word highlighting */}
              {currentLine && (
                <div className="absolute bottom-4 left-4 right-4 text-center">
                  <div className="bg-black/70 text-white px-4 py-2 rounded-lg inline-block">
                    <WordHighlight
                      text={currentLine.text}
                      currentTime={currentTime}
                      startTime={currentLine.startTime}
                      endTime={currentLine.endTime}
                    />
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className={`text-center ${isLandscape ? 'w-2/3' : 'w-full max-w-4xl'}`}>
              <audio
                ref={mediaRef as React.RefObject<HTMLAudioElement>}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onEnded={() => setIsPlaying(false)}
                className="hidden"
              />
              
              {/* Audio Visualization */}
              <div className="mb-8">
                <div className={`w-32 h-32 mx-auto rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center ${isPlaying ? 'animate-pulse' : ''}`}>
                  <Volume2 className="h-16 w-16 text-white" />
                </div>
                {isPlaying && (
                  <div className="mt-4 flex justify-center gap-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div
                        key={i}
                        className="w-2 bg-primary rounded-full animate-pulse"
                        style={{
                          height: `${20 + Math.random() * 40}px`,
                          animationDelay: `${i * 0.1}s`
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Audio Large Text Display with Word Highlighting */}
              {currentLine && (
                <div className="mb-8">
                  <div className="text-2xl md:text-4xl lg:text-6xl font-bold text-primary animate-fade-in leading-tight">
                    <WordHighlight
                      text={currentLine.text}
                      currentTime={currentTime}
                      startTime={currentLine.startTime}
                      endTime={currentLine.endTime}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Landscape mode transcript panel */}
          {isLandscape && transcriptionLines.length > 0 && (
            <div className="w-1/3 h-full ml-4 bg-gray-900/80 rounded-lg p-4 overflow-y-auto">
              <h3 className="text-lg font-semibold mb-4 text-white">Transcript</h3>
              <div className="space-y-2">
                {transcriptionLines.map((line, index) => {
                  const isActive = currentTime >= line.startTime && currentTime <= line.endTime;
                  return (
                    <div
                      key={index}
                      className={`p-2 rounded transition-all cursor-pointer ${
                        isActive 
                          ? 'bg-primary text-primary-foreground' 
                          : 'text-gray-300 hover:bg-gray-800'
                      }`}
                      onClick={() => {
                        if (mediaRef.current) {
                          mediaRef.current.currentTime = line.startTime;
                        }
                      }}
                    >
                      <div className="text-xs text-gray-400 mb-1">{line.timestamp}</div>
                      <WordHighlight
                        text={line.text}
                        currentTime={currentTime}
                        startTime={line.startTime}
                        endTime={line.endTime}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Controls */}
        <Card className="m-4 bg-gray-900/80 border-gray-700 backdrop-blur">
          <CardContent className="p-4">
            <div className="flex items-center justify-center gap-4">
              <Button
                variant="outline"
                onClick={handleRestart}
                className="border-secondary text-secondary hover:bg-secondary/10"
              >
                <RotateCcw className="h-5 w-5" />
              </Button>
              
              <Button
                onClick={handlePlayPause}
                className="bg-primary hover:bg-primary/90 text-white px-8 py-3 text-lg"
              >
                {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
              </Button>
              
              <div className="text-sm text-gray-400">
                {formatTime(currentTime)} / {formatTime(duration)}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Desktop layout (unchanged)
  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <div className="flex-1 flex items-center justify-center p-4">
        {isVideo ? (
          <div className="relative w-full max-w-4xl">
            <video
              ref={mediaRef as React.RefObject<HTMLVideoElement>}
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
              onEnded={() => setIsPlaying(false)}
              className="w-full h-auto rounded-lg"
              controls={false}
            />
            {/* Video Subtitles with word highlighting */}
            {currentLine && (
              <div className="absolute bottom-4 left-4 right-4 text-center">
                <div className="bg-black/70 text-white px-4 py-2 rounded-lg inline-block">
                  <WordHighlight
                    text={currentLine.text}
                    currentTime={currentTime}
                    startTime={currentLine.startTime}
                    endTime={currentLine.endTime}
                  />
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="w-full max-w-4xl text-center">
            <audio
              ref={mediaRef as React.RefObject<HTMLAudioElement>}
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
              onEnded={() => setIsPlaying(false)}
              className="hidden"
            />
            
            {/* Audio Visualization */}
            <div className="mb-8">
              <div className={`w-32 h-32 mx-auto rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center ${isPlaying ? 'animate-pulse' : ''}`}>
                <Volume2 className="h-16 w-16 text-white" />
              </div>
              {isPlaying && (
                <div className="mt-4 flex justify-center gap-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div
                      key={i}
                      className="w-2 bg-primary rounded-full animate-pulse"
                      style={{
                        height: `${20 + Math.random() * 40}px`,
                        animationDelay: `${i * 0.1}s`
                      }}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Audio Large Text Display with Word Highlighting */}
            {currentLine && (
              <div className="mb-8">
                <div className="text-4xl md:text-6xl font-bold text-primary animate-fade-in leading-tight">
                  <WordHighlight
                    text={currentLine.text}
                    currentTime={currentTime}
                    startTime={currentLine.startTime}
                    endTime={currentLine.endTime}
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Controls */}
      <Card className="m-4 bg-gray-900 border-gray-700">
        <CardContent className="p-4">
          <div className="flex items-center justify-center gap-4">
            <Button
              variant="outline"
              onClick={handleRestart}
              className="border-secondary text-secondary hover:bg-secondary/10"
            >
              <RotateCcw className="h-5 w-5" />
            </Button>
            
            <Button
              onClick={handlePlayPause}
              className="bg-primary hover:bg-primary/90 text-white px-8 py-3 text-lg"
            >
              {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
            </Button>
            
            <div className="text-sm text-gray-400">
              {formatTime(currentTime)} / {formatTime(duration)}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PlayerPage;
