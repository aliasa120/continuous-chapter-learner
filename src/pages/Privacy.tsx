
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Shield } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const Privacy = () => {
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
              <Shield className="h-5 w-5" />
              Privacy Policy
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 text-sm leading-relaxed">
            <section>
              <h3 className="font-semibold text-gray-900 mb-2">Data Collection</h3>
              <p className="text-gray-700">
                We only process the audio/video files you upload for transcription purposes. Files are processed temporarily and are not stored permanently on our servers.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-gray-900 mb-2">File Processing</h3>
              <p className="text-gray-700">
                Your uploaded files are sent to Google's Gemini AI service for transcription. Files are automatically deleted after processing is complete.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-gray-900 mb-2">No Personal Data Storage</h3>
              <p className="text-gray-700">
                We do not collect, store, or retain any personal information. All transcription results are processed in real-time and displayed directly to you.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-gray-900 mb-2">Third-Party Services</h3>
              <p className="text-gray-700">
                We use Google's Gemini AI for transcription services. Please refer to Google's privacy policy for information about their data handling practices.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-gray-900 mb-2">Contact</h3>
              <p className="text-gray-700">
                If you have any questions about this privacy policy, please contact us through our support channels.
              </p>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Privacy;
