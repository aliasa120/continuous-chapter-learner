
import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import FileUpload from '../components/FileUpload';
import LanguageSelector from '../components/LanguageSelector';
import TranscriptionResult from '../components/TranscriptionResult';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Wand2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

export interface TranscriptionLine {
  timestamp: string;
  text: string;
  startTime: number; // in seconds
}

const TranscribePage = () => {
  const [file, setFile] = useState<File | null>(null);
  const [language, setLanguage] = useState("english");
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcriptionLines, setTranscriptionLines] = useState<TranscriptionLine[]>([]);
  const [apiKey, setApiKey] = useState<string>("");
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
    
    // In a real implementation, we would use Groq Whisper v3 API here
    // Mock implementation for now
    setTimeout(() => {
      // Generate mock transcription with timestamps
      const mockTranscription: TranscriptionLine[] = [
        { timestamp: "00:00:02", text: "Hello and welcome to this introduction about AI transcription technology.", startTime: 2 },
        { timestamp: "00:00:08", text: "Today we'll explore how modern AI can convert speech to text with high accuracy.", startTime: 8 },
        { timestamp: "00:00:14", text: "The system works by analyzing audio patterns and matching them to known language models.", startTime: 14 },
        { timestamp: "00:00:21", text: "This technology has improved dramatically in recent years, thanks to advances in machine learning.", startTime: 21 },
        { timestamp: "00:00:28", text: "Users can now transcribe content in multiple languages with impressive accuracy.", startTime: 28 },
        { timestamp: "00:00:35", text: "The process begins by uploading your audio or video file to the platform.", startTime: 35 },
        { timestamp: "00:00:41", text: "Then you select your desired language for the transcription output.", startTime: 41 },
        { timestamp: "00:00:47", text: "Within minutes, you'll receive a fully formatted transcript with timestamps.", startTime: 47 },
        { timestamp: "00:00:54", text: "These timestamps make it easy to navigate through long recordings.", startTime: 54 },
        { timestamp: "00:01:01", text: "You can also edit the transcription if you notice any inaccuracies.", startTime: 61 },
        { timestamp: "00:01:08", text: "The system continues to learn and improve with each transcription it processes.", startTime: 68 },
      ];
      
      setTranscriptionLines(mockTranscription);
      setIsTranscribing(false);
      
      toast({
        title: "Transcription complete!",
        description: "Your audio has been successfully transcribed.",
      });
    }, 3000);
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
      } else {
        media.play();
      }
      setIsPlaying(!isPlaying);
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
        />
      );
    }
    
    return null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 py-12">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <Link to="/" className="inline-flex items-center text-indigo-600 hover:text-indigo-800 transition-colors">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to home
          </Link>
        </div>

        <h1 className="text-3xl md:text-4xl font-bold mb-8 text-center bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
          Transcribe Your Content
        </h1>

        <div className="max-w-6xl mx-auto">
          {/* Horizontal cards layout */}
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Transcription Wizard Card */}
            <div className="w-full lg:w-1/2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg text-white p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center">
                <Wand2 className="mr-2 h-5 w-5" /> 
                Transcription Wizard
              </h2>
              <p className="mb-6 text-indigo-100">
                Upload your audio or video file, select a language, and let our AI do the magic.
              </p>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-indigo-100 mb-1">
                    Upload File
                  </label>
                  <FileUpload file={file} setFile={setFile} />
                </div>
                
                <LanguageSelector language={language} setLanguage={setLanguage} />
                
                <Button 
                  onClick={handleTranscribe} 
                  disabled={!file || isTranscribing}
                  className="w-full bg-white text-indigo-600 hover:bg-indigo-50"
                >
                  {isTranscribing ? "Transcribing..." : "Start Transcription"}
                </Button>
              </div>
            </div>
            
            {/* Transcription Results Card */}
            <div className="w-full lg:w-1/2 bg-white rounded-xl shadow-lg">
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-xl font-bold text-gray-800">
                  Transcription Results
                </h2>
              </div>
              
              <TranscriptionResult
                transcriptionLines={transcriptionLines}
                isTranscribing={isTranscribing}
                currentTime={currentTime}
                seekToTimestamp={seekToTimestamp}
                isPlaying={isPlaying}
                onPlayPause={handlePlayPause}
              />
            </div>
          </div>
          
          <div className="mt-6 text-center text-sm text-gray-500">
            Supports MP3, WAV, MP4, or MOV files up to 100MB
          </div>
        </div>
      </div>
      
      {renderMediaElement()}
    </div>
  );
};

export default TranscribePage;
