
import React, { useRef, useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Play, Pause, RotateCcw, Volume2, ExternalLink, Maximize } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { TranscriptionLine } from '../utils/geminiTranscription';

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
  transcriptionLines?: TranscriptionLine[];
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
  seekToTimestamp,
  transcriptionLines = []
}) => {
  const mediaRef = useRef<HTMLVideoElement | HTMLAudioElement>(null);
  const navigate = useNavigate();
  const isVideo = file?.type.startsWith('video/');
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const media = mediaRef.current;
    if (media && audioUrl) {
      media.src = audioUrl;
      console.log('Media source set:', audioUrl);
    }
  }, [audioUrl]);

  // Sync play/pause state with media element
  useEffect(() => {
    const media = mediaRef.current;
    if (media) {
      if (isPlaying) {
        const playPromise = media.play();
        if (playPromise) {
          playPromise.catch(error => {
            console.error('Play failed:', error);
          });
        }
      } else {
        media.pause();
      }
    }
  }, [isPlaying]);

  // Sync current time with media element
  useEffect(() => {
    const media = mediaRef.current;
    if (media && Math.abs(media.currentTime - currentTime) > 0.5) {
      media.currentTime = currentTime;
    }
  }, [currentTime]);

  const handleTimeUpdate = (e: React.SyntheticEvent<HTMLVideoElement | HTMLAudioElement>) => {
    onTimeUpdate(e.currentTarget.currentTime);
  };

  const handleLoadedMetadata = (e: React.SyntheticEvent<HTMLVideoElement | HTMLAudioElement>) => {
    console.log('Media loaded, duration:', e.currentTarget.duration);
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

  const openPlayer = () => {
    if (!audioUrl || transcriptionLines.length === 0) {
      console.log('Cannot open player - missing audioUrl or transcription');
      return;
    }
    
    console.log('Opening player with transcription lines:', transcriptionLines.length);
    
    const params = new URLSearchParams({
      audioUrl,
      isVideo: isVideo ? 'true' : 'false',
      transcription: encodeURIComponent(JSON.stringify(transcriptionLines))
    });
    
    const url = `/player?${params.toString()}`;
    console.log('Player URL:', url);
    
    if (isMobile) {
      // On mobile, navigate to the same page but in fullscreen mode
      navigate(url);
    } else {
      // On desktop, open in new tab
      window.open(url, '_blank');
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!audioUrl) return null;

  const hasTranscription = transcriptionLines.length > 0;

  return (
    <Card className="border-primary/20 shadow-lg bg-card backdrop-blur">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-primary">
            {isVideo ? '🎬' : '🎵'} {isVideo ? 'Video' : 'Audio'} Player
          </CardTitle>
          <div className="flex gap-2">
            {hasTranscription && (
              <Button
                variant="outline"
                size="sm"
                onClick={openPlayer}
                className="border-primary text-primary hover:bg-primary/10 px-3 py-2"
                title={isMobile ? "Open fullscreen player" : "Open in separate tab with subtitles"}
              >
                {isMobile ? (
                  <>
                    <Maximize className="h-4 w-4 mr-1" />
                    <span className="hidden sm:inline">Fullscreen</span>
                  </>
                ) : (
                  <>
                    <ExternalLink className="h-4 w-4 mr-1" />
                    <span className="hidden sm:inline">New Tab</span>
                  </>
                )}
              </Button>
            )}
            {!hasTranscription && (
              <div className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                Complete transcription to access player
              </div>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {isVideo ? (
          <video
            ref={mediaRef as React.RefObject<HTMLVideoElement>}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onEnded={onEnded}
            onError={(e) => console.error('Video error:', e)}
            className="w-full rounded-lg bg-black"
            controls={false}
            style={{ maxHeight: '300px' }}
            playsInline
          />
        ) : (
          <audio
            ref={mediaRef as React.RefObject<HTMLAudioElement>}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onEnded={onEnded}
            onError={(e) => console.error('Audio error:', e)}
            className="hidden"
            preload="metadata"
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
