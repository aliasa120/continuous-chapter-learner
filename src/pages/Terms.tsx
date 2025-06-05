
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const Terms = () => {
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
              <FileText className="h-5 w-5" />
              Terms of Use
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 text-sm leading-relaxed">
            <section>
              <h3 className="font-semibold text-gray-900 mb-2">Service Description</h3>
              <p className="text-gray-700">
                This service provides AI-powered transcription and translation of audio and video files. The service is provided "as is" for personal and professional use.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-gray-900 mb-2">Acceptable Use</h3>
              <p className="text-gray-700">
                You may use this service for legitimate transcription purposes. You must not upload content that is illegal, harmful, or violates the rights of others.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-gray-900 mb-2">File Limitations</h3>
              <p className="text-gray-700">
                Files must be under 100MB and in supported formats (MP3, WAV, MP4, MOV, etc.). Processing time may vary based on file size and complexity.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-gray-900 mb-2">Accuracy Disclaimer</h3>
              <p className="text-gray-700">
                While we strive for high accuracy, AI transcription may contain errors. Users should review and verify transcriptions for critical applications.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-gray-900 mb-2">Limitation of Liability</h3>
              <p className="text-gray-700">
                The service is provided without warranties. We are not liable for any damages arising from the use of this service or inaccuracies in transcriptions.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-gray-900 mb-2">Changes to Terms</h3>
              <p className="text-gray-700">
                We reserve the right to modify these terms at any time. Continued use of the service constitutes acceptance of updated terms.
              </p>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Terms;
