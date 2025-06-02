
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, FileAudio, Globe, Sparkles, Star } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const Home = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50">
      <div className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-20">
          <div className="inline-block animate-bounce bg-green-100 p-2 rounded-full mb-6">
            <FileAudio className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-green-600 to-emerald-500 bg-clip-text text-transparent">
            Audio & Video Transcriber
          </h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto mb-10">
            Transform your audio and video content into text with our advanced AI transcription tool.
            Fast, accurate, and available in multiple languages.
          </p>
          <Link to="/transcribe">
            <Button 
              className="text-lg px-8 py-6 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all"
            >
              Start Transcribing Now <ArrowRight className="ml-2" />
            </Button>
          </Link>
        </div>
        
        {/* Features Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-20">
          <Card className="border-0 shadow-lg hover:shadow-xl transition-all bg-white backdrop-blur-sm border-green-100 overflow-hidden transform hover:-translate-y-2">
            <div className="h-2 bg-gradient-to-r from-green-400 to-green-600"></div>
            <CardContent className="pt-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileAudio className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-center mb-3 text-green-800">Multiple Formats</h3>
              <p className="text-gray-600 text-center">
                Support for a wide range of audio and video formats including MP3, WAV, MP4, and MOV files.
              </p>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-lg hover:shadow-xl transition-all bg-white backdrop-blur-sm border-green-100 overflow-hidden transform hover:-translate-y-2">
            <div className="h-2 bg-gradient-to-r from-green-400 to-green-600"></div>
            <CardContent className="pt-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Globe className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-center mb-3 text-green-800">12+ Languages</h3>
              <p className="text-gray-600 text-center">
                Transcribe content in over a dozen languages with high accuracy and natural language processing.
              </p>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-lg hover:shadow-xl transition-all bg-white backdrop-blur-sm border-green-100 overflow-hidden transform hover:-translate-y-2">
            <div className="h-2 bg-gradient-to-r from-green-400 to-green-600"></div>
            <CardContent className="pt-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-center mb-3 text-green-800">Time-Stamped</h3>
              <p className="text-gray-600 text-center">
                Get precise timestamps for every line of text, making it easy to navigate through long transcriptions.
              </p>
            </CardContent>
          </Card>
        </div>
        
        {/* CTA Section */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl shadow-xl p-10 text-white text-center">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <Star className="h-12 w-12 text-yellow-300 animate-pulse" />
              <div className="absolute -top-3 -right-3">
                <Star className="h-6 w-6 text-yellow-200" />
              </div>
            </div>
          </div>
          <h2 className="text-3xl font-bold mb-4">Ready to transform your audio and video?</h2>
          <p className="text-lg mb-6 max-w-2xl mx-auto">
            Experience the power of AI-driven transcription with accurate timestamps and multiple language support.
          </p>
          <Link to="/transcribe">
            <Button variant="secondary" size="lg" className="font-medium bg-white text-green-700 hover:bg-green-50">
              Start Transcribing
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;
