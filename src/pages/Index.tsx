
import React, { useState, useRef } from 'react';
import FileUpload from '../components/FileUpload';
import LanguageSelector from '../components/LanguageSelector';
import TranscriptionResult from '../components/TranscriptionResult';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { FileAudio, Sparkles, Wand2 } from 'lucide-react';
import type { TranscriptionLine } from '../pages/TranscribePage';

const Index = () => {
  const [file, setFile] = useState<File | null>(null);
  const [language, setLanguage] = useState("english");
  const [transcriptionLines, setTranscriptionLines] = useState<TranscriptionLine[]>([]);
  const [isTranscribing, setIsTranscribing] = useState(false);
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
    
    // In a real app, this would connect to a transcription API
    // Simulating a delay for demonstration purposes
    setTimeout(() => {
      // Generate mock transcription with timestamps
      const mockTranscription: TranscriptionLine[] = [
        { timestamp: "00:00:02", text: "This is a simulated transcription of the file.", startTime: 2 },
        { timestamp: "00:00:08", text: `In a real application, this would use Groq Whisper v3 for ${file.name} in ${language}.`, startTime: 8 },
        { timestamp: "00:00:15", text: "You would need to provide an API key to access the transcription service.", startTime: 15 },
      ];
      
      setTranscriptionLines(mockTranscription);
      setIsTranscribing(false);
      
      toast({
        title: "Transcription complete!",
        description: "Your transcription has been generated successfully.",
      });
    }, 2000);
  };

  const handleClear = () => {
    setFile(null);
    setTranscriptionLines([]);
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

  // Render media element based on file type
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
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white">
      <div className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-green-600 to-emerald-500 bg-clip-text text-transparent">
            Audio & Video Transcriber
          </h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
            Convert your audio and video files to text with just a few clicks. Fast, accurate, and available in multiple languages.
          </p>
        </div>
        
        {/* Main Content */}
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-green-100 transform transition-all hover:shadow-xl hover:-translate-y-1">
              <div className="bg-gradient-to-r from-green-500 to-emerald-500 py-4 px-6">
                <h2 className="text-2xl font-semibold text-white flex items-center">
                  <Wand2 className="mr-2 h-5 w-5" />
                  Upload Media
                </h2>
              </div>
              <div className="p-6 space-y-6">
                <FileUpload file={file} setFile={setFile} />
                <LanguageSelector language={language} setLanguage={setLanguage} />
                
                <div className="flex space-x-3">
                  <Button 
                    onClick={handleTranscribe} 
                    disabled={!file || isTranscribing}
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 shadow-md hover:shadow-lg transition-all"
                  >
                    {isTranscribing ? "Transcribing..." : "Transcribe Now"}
                  </Button>
                  
                  {file && (
                    <Button 
                      variant="outline" 
                      onClick={handleClear}
                      className="flex-shrink-0 border-green-200 hover:bg-green-50 text-green-700"
                    >
                      Clear
                    </Button>
                  )}
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-green-100 transform transition-all hover:shadow-xl">
              <div className="bg-gradient-to-r from-green-500 to-emerald-500 py-4 px-6">
                <h2 className="text-2xl font-semibold text-white flex items-center">
                  <FileAudio className="mr-2 h-5 w-5" />
                  Transcription Result
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
          
          <div className="bg-green-50 p-6 rounded-xl mt-6 border border-green-100 shadow-sm">
            <div className="flex flex-col md:flex-row items-center justify-between text-sm text-gray-600">
              <p>Upload MP3, WAV, MP4, or MOV files up to 100MB</p>
              <p className="mt-2 md:mt-0">Transcription speed may vary based on file length</p>
            </div>
          </div>
        </div>
        
        {renderMediaElement()}
        
        {/* Features */}
        <div className="mt-20 grid md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-2xl shadow-lg border border-green-100 transform transition-all hover:-translate-y-2 hover:shadow-xl">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Sparkles className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold mb-3 text-center text-green-800">Fast Processing</h3>
            <p className="text-gray-600 text-center">Get your transcriptions in minutes, not hours. Our system is optimized for speed and accuracy.</p>
          </div>
          
          <div className="bg-white p-8 rounded-2xl shadow-lg border border-green-100 transform transition-all hover:-translate-y-2 hover:shadow-xl">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-3 text-center text-green-800">Multiple Languages</h3>
            <p className="text-gray-600 text-center">Support for various languages so you can transcribe content from around the world.</p>
          </div>
          
          <div className="bg-white p-8 rounded-2xl shadow-lg border border-green-100 transform transition-all hover:-translate-y-2 hover:shadow-xl">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-3 text-center text-green-800">Secure & Private</h3>
            <p className="text-gray-600 text-center">Your files are encrypted and automatically deleted after processing for your privacy.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
