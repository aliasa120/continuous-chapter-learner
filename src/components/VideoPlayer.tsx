
import React, { useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Play, Pause, RotateCcw, Volume2 } from 'lucide-react';

interface VideoPlayerProps {
  file: File | null;
  audioUrl: string | null;
  currentTime: number;
  duration: number;
  isPlaying: boolean;
  onTimeUpdate: (time: number) => void;
  onLoadedMetadata: (duration: number) => void;
  onEnded: () => void;
  onPlayPause: () => void;
  onRestart: () => void;
  seekToTimestamp: (seconds: number) => void;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({
  file,
  audioUrl,
  currentTime,
  duration,
  isPlaying,
  onTimeUpdate,
  onLoadedMetadata,
  onEnded,
  onPlayPause,
  onRestart,
  seekToTimestamp
}) => {
  const mediaRef = useRef<HTMLVideoElement | HTMLAudioElement>(null);
  const isVideo = file?.type.startsWith('video/');

  useEffect(() => {
    const media = mediaRef.current;
    if (media && audioUrl) {
      media.src = audioUrl;
    }
  }, [audioUrl]);

  const handleTimeUpdate = (e: React.SyntheticEvent<HTMLVideoElement | HTMLAudioElement>) => {
    onTimeUpdate(e.currentTarget.currentTime);
  };

  const handleLoadedMetadata = (e: React.SyntheticEvent<HTMLVideoElement | HTMLAudioElement>) => {
    onLoadedMetadata(e.currentTarget.duration);
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!mediaRef.current || !duration) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = clickX / rect.width;
    const newTime = percentage * duration;
    
    seekToTimestamp(newTime);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!audioUrl) return null;

  return (
    <Card className="border-primary/20 shadow-lg bg-card backdrop-blur">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-primary">
          {isVideo ? '🎬' : '🎵'} {isVideo ? 'Video' : 'Audio'} Player
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isVideo ? (
          <video
            ref={mediaRef as React.RefObject<HTMLVideoElement>}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onEnded={onEnded}
            className="w-full rounded-lg bg-black"
            controls={false}
            style={{ maxHeight: '300px' }}
          />
        ) : (
          <audio
            ref={mediaRef as React.RefObject<HTMLAudioElement>}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onEnded={onEnded}
            className="hidden"
          />
        )}
        
        {!isVideo && (
          <div className="flex items-center justify-center h-32 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-lg border border-primary/20">
            <Volume2 className="h-12 w-12 text-primary/60" />
          </div>
        )}
        
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={onPlayPause}
              className="border-primary text-primary hover:bg-primary/10"
            >
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onRestart}
              className="border-secondary text-secondary hover:bg-secondary/10"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
            <div className="text-sm text-muted-foreground">
              {formatTime(currentTime)} / {formatTime(duration)}
            </div>
          </div>
          
          <div 
            className="relative cursor-pointer" 
            onClick={handleSeek}
          >
            <Progress value={(currentTime / duration) * 100} className="h-3" />
            <div 
              className="absolute top-0 w-3 h-3 bg-primary rounded-full transform -translate-x-1.5 transition-all duration-200 hover:scale-125"
              style={{ left: `${(currentTime / duration) * 100}%` }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default VideoPlayer;
