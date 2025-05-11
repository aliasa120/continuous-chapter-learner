
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, FileAudio, Globe } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const Home = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      <div className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-20">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 bg-clip-text text-transparent">
            Audio & Video Transcriber
          </h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto mb-10">
            Transform your audio and video content into text with our advanced AI transcription tool.
            Fast, accurate, and available in multiple languages.
          </p>
          <Link to="/transcribe">
            <Button 
              className="text-lg px-8 py-6 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all"
            >
              Start Transcribing Now <ArrowRight className="ml-2" />
            </Button>
          </Link>
        </div>
        
        {/* Features Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-20">
          <Card className="border-0 shadow-lg hover:shadow-xl transition-all bg-white/70 backdrop-blur-sm">
            <CardContent className="pt-6">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileAudio className="h-8 w-8 text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold text-center mb-3">Multiple Formats</h3>
              <p className="text-gray-600 text-center">
                Support for a wide range of audio and video formats including MP3, WAV, MP4, and MOV files.
              </p>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-lg hover:shadow-xl transition-all bg-white/70 backdrop-blur-sm">
            <CardContent className="pt-6">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Globe className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-center mb-3">12+ Languages</h3>
              <p className="text-gray-600 text-center">
                Transcribe content in over a dozen languages with high accuracy and natural language processing.
              </p>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-lg hover:shadow-xl transition-all bg-white/70 backdrop-blur-sm">
            <CardContent className="pt-6">
              <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-pink-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-center mb-3">Time-Stamped</h3>
              <p className="text-gray-600 text-center">
                Get precise timestamps for every line of text, making it easy to navigate through long transcriptions.
              </p>
            </CardContent>
          </Card>
        </div>
        
        {/* CTA Section */}
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl shadow-xl p-10 text-white text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to transform your audio and video?</h2>
          <p className="text-lg mb-6 max-w-2xl mx-auto">
            Experience the power of AI-driven transcription with accurate timestamps and multiple language support.
          </p>
          <Link to="/transcribe">
            <Button variant="secondary" size="lg" className="font-medium">
              Start Transcribing
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;
