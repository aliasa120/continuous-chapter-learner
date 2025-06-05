
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Upload, Wand2, FileText, HelpCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const HowItWorks = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white py-4 pb-20">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-6">
          <Link to="/" className="inline-flex items-center text-green-600 hover:text-green-800 transition-colors">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to home
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-700">
              <HelpCircle className="h-5 w-5" />
              How It Works
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="grid gap-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <Upload className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">1. Upload Your File</h3>
                  <p className="text-gray-700 text-sm">
                    Upload any audio or video file (MP3, WAV, MP4, MOV, etc.) up to 100MB. Simply drag and drop or click to browse.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <Wand2 className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">2. AI Processing</h3>
                  <p className="text-gray-700 text-sm">
                    Our advanced AI processes your file with speaker identification, confidence scoring, and precise timing for accurate transcription.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <FileText className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">3. Get Results</h3>
                  <p className="text-gray-700 text-sm">
                    View your transcription with word-by-word highlighting, speaker identification, and AI-powered summaries and explanations.
                  </p>
                </div>
              </div>
            </div>

            <div className="border-t pt-6">
              <h3 className="font-semibold text-gray-900 mb-4">Features</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="text-sm">
                  <p className="font-medium text-green-700 mb-1">🎯 Word-by-word highlighting</p>
                  <p className="text-gray-600">Real-time word highlighting as audio plays</p>
                </div>
                <div className="text-sm">
                  <p className="font-medium text-green-700 mb-1">👥 Speaker identification</p>
                  <p className="text-gray-600">Automatic detection of different speakers</p>
                </div>
                <div className="text-sm">
                  <p className="font-medium text-green-700 mb-1">📊 Confidence scoring</p>
                  <p className="text-gray-600">Accuracy indicators for each segment</p>
                </div>
                <div className="text-sm">
                  <p className="font-medium text-green-700 mb-1">🤖 AI insights</p>
                  <p className="text-gray-600">Automated summaries and explanations</p>
                </div>
                <div className="text-sm">
                  <p className="font-medium text-green-700 mb-1">🌍 100+ languages</p>
                  <p className="text-gray-600">Support for multiple languages</p>
                </div>
                <div className="text-sm">
                  <p className="font-medium text-green-700 mb-1">📱 Mobile optimized</p>
                  <p className="text-gray-600">Perfect for mobile devices</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default HowItWorks;
