
import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Pause, RotateCcw, Volume2 } from 'lucide-react';
import type { TranscriptionLine } from '../utils/geminiTranscription';

const PlayerPage = () => {
  const [searchParams] = useSearchParams();
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [transcriptionLines, setTranscriptionLines] = useState<TranscriptionLine[]>([]);
  const [currentSubtitle, setCurrentSubtitle] = useState<string>('');
  
  const mediaRef = useRef<HTMLVideoElement | HTMLAudioElement>(null);
  
  const audioUrl = searchParams.get('audioUrl');
  const isVideo = searchParams.get('isVideo') === 'true';
  const transcriptionData = searchParams.get('transcription');

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

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!audioUrl) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <p>No media file provided</p>
      </div>
    );
  }

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
            {/* Video Subtitles */}
            {currentSubtitle && (
              <div className="absolute bottom-4 left-4 right-4 text-center">
                <div className="bg-black/70 text-white px-4 py-2 rounded-lg inline-block">
                  <p className="text-lg font-medium">{currentSubtitle}</p>
                </div>
              </div>
            )}
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

            {/* Audio Large Text Display */}
            {currentSubtitle && (
              <div className="mb-8">
                <p className="text-4xl md:text-6xl font-bold text-primary animate-fade-in leading-tight">
                  {currentSubtitle}
                </p>
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
