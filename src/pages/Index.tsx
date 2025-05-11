
import React, { useState } from 'react';
import FileUpload from '../components/FileUpload';
import LanguageSelector from '../components/LanguageSelector';
import TranscriptionResult from '../components/TranscriptionResult';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

const Index = () => {
  const [file, setFile] = useState<File | null>(null);
  const [language, setLanguage] = useState("english");
  const [transcription, setTranscription] = useState("");
  const [isTranscribing, setIsTranscribing] = useState(false);
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
    
    // In a real app, this would connect to a transcription API
    // Simulating a delay for demonstration purposes
    setTimeout(() => {
      setTranscription(
        `This is a simulated transcription of the ${file.name} file in ${language}. 
        In a real application, this text would be the result of processing your audio 
        or video through a transcription service API.`
      );
      setIsTranscribing(false);
      
      toast({
        title: "Transcription complete!",
        description: "Your transcription has been generated successfully.",
      });
    }, 2000);
  };

  const handleClear = () => {
    setFile(null);
    setTranscription("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-100 via-indigo-50 to-blue-100">
      <div className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Audio & Video Transcriber
          </h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
            Convert your audio and video files to text with just a few clicks. Fast, accurate, and available in multiple languages.
          </p>
        </div>
        
        {/* Main Content */}
        <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="grid md:grid-cols-2 gap-6 p-8">
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold text-gray-800">Upload Media</h2>
              <FileUpload file={file} setFile={setFile} />
              <LanguageSelector language={language} setLanguage={setLanguage} />
              
              <div className="flex space-x-3">
                <Button 
                  onClick={handleTranscribe} 
                  disabled={!file || isTranscribing}
                  className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700"
                >
                  {isTranscribing ? "Transcribing..." : "Transcribe Now"}
                </Button>
                
                {file && (
                  <Button 
                    variant="outline" 
                    onClick={handleClear}
                    className="flex-shrink-0"
                  >
                    Clear
                  </Button>
                )}
              </div>
            </div>
            
            <div>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">Transcription Result</h2>
              <TranscriptionResult transcription={transcription} isTranscribing={isTranscribing} />
            </div>
          </div>
          
          <div className="bg-gray-50 p-6 border-t border-gray-100">
            <div className="flex flex-col md:flex-row items-center justify-between text-sm text-gray-500">
              <p>Upload MP3, WAV, MP4, or MOV files up to 100MB</p>
              <p className="mt-2 md:mt-0">Transcription speed may vary based on file length</p>
            </div>
          </div>
        </div>
        
        {/* Features */}
        <div className="mt-20 grid md:grid-cols-3 gap-8 text-center">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Fast Processing</h3>
            <p className="text-gray-600">Get your transcriptions in minutes, not hours. Our system is optimized for speed.</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Multiple Languages</h3>
            <p className="text-gray-600">Support for various languages so you can transcribe content from around the world.</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Secure & Private</h3>
            <p className="text-gray-600">Your files are encrypted and automatically deleted after processing for your privacy.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
