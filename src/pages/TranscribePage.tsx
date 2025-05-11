
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import FileUpload from '../components/FileUpload';
import LanguageSelector from '../components/LanguageSelector';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Wand2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent } from '@/components/ui/card';

interface TranscriptionLine {
  timestamp: string;
  text: string;
}

const TranscribePage = () => {
  const [file, setFile] = useState<File | null>(null);
  const [language, setLanguage] = useState("english");
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcriptionLines, setTranscriptionLines] = useState<TranscriptionLine[]>([]);
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
    
    // Simulate a loading time
    setTimeout(() => {
      // Generate mock transcription with timestamps
      const mockTranscription: TranscriptionLine[] = [
        { timestamp: "00:00:02", text: "Hello and welcome to this introduction about AI transcription technology." },
        { timestamp: "00:00:08", text: "Today we'll explore how modern AI can convert speech to text with high accuracy." },
        { timestamp: "00:00:14", text: "The system works by analyzing audio patterns and matching them to known language models." },
        { timestamp: "00:00:21", text: "This technology has improved dramatically in recent years, thanks to advances in machine learning." },
        { timestamp: "00:00:28", text: "Users can now transcribe content in multiple languages with impressive accuracy." },
        { timestamp: "00:00:35", text: "The process begins by uploading your audio or video file to the platform." },
        { timestamp: "00:00:41", text: "Then you select your desired language for the transcription output." },
        { timestamp: "00:00:47", text: "Within minutes, you'll receive a fully formatted transcript with timestamps." },
        { timestamp: "00:00:54", text: "These timestamps make it easy to navigate through long recordings." },
        { timestamp: "00:01:01", text: "You can also edit the transcription if you notice any inaccuracies." },
        { timestamp: "00:01:08", text: "The system continues to learn and improve with each transcription it processes." },
      ];
      
      setTranscriptionLines(mockTranscription);
      setIsTranscribing(false);
      
      toast({
        title: "Transcription complete!",
        description: "Your audio has been successfully transcribed.",
      });
    }, 3000);
  };

  const renderTranscriptionResults = () => {
    if (isTranscribing) {
      return (
        <div className="py-12 flex flex-col items-center">
          <div className="w-12 h-12 rounded-full border-4 border-t-indigo-600 border-r-transparent border-b-indigo-300 border-l-indigo-600 animate-spin mb-4"></div>
          <p className="text-gray-700 animate-pulse">Transcribing your content...</p>
          <p className="text-sm text-gray-500 mt-2">This may take a minute</p>
        </div>
      );
    }

    if (transcriptionLines.length === 0) {
      return (
        <div className="py-12 text-center">
          <p className="text-gray-500">Your transcription will appear here</p>
        </div>
      );
    }

    return (
      <div className="max-h-[400px] overflow-y-auto pr-1">
        {transcriptionLines.map((line, index) => (
          <div key={index} className="mb-4 flex">
            <div className="w-20 flex-shrink-0 text-sm font-mono text-indigo-600 pt-1">
              {line.timestamp}
            </div>
            <p className="text-gray-700">{line.text}</p>
          </div>
        ))}
      </div>
    );
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

        <div className="max-w-3xl mx-auto">
          <Card className="overflow-hidden shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardContent className="p-0">
              <div className="grid md:grid-cols-2">
                <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-8 text-white">
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
                
                <div className="p-8">
                  <h2 className="text-xl font-bold mb-4 text-gray-800">
                    Transcription Results
                  </h2>
                  {renderTranscriptionResults()}
                </div>
              </div>
            </CardContent>
          </Card>
          
          <div className="mt-6 text-center text-sm text-gray-500">
            Supports MP3, WAV, MP4, or MOV files up to 100MB
          </div>
        </div>
      </div>
    </div>
  );
};

export default TranscribePage;
