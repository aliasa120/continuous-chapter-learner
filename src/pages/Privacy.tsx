
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Shield } from 'lucide-react';

const Privacy = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 py-6">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-6">
          <Button asChild variant="ghost" className="text-primary hover:bg-primary/10">
            <Link to="/">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Link>
          </Button>
        </div>

        <Card className="border-primary/20 shadow-lg bg-card/50 backdrop-blur">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl text-primary">
              <Shield className="h-6 w-6" />
              Privacy Policy
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-8 text-foreground">
            <section>
              <h3 className="text-xl font-semibold mb-4 text-accent">Data Collection</h3>
              <p className="text-muted-foreground leading-relaxed">
                We only process the audio/video files you upload for transcription purposes. Files are processed 
                temporarily and are not stored permanently on our servers. We do not collect any personal information 
                beyond what is necessary for the transcription service.
              </p>
            </section>

            <section>
              <h3 className="text-xl font-semibold mb-4 text-accent">File Processing</h3>
              <p className="text-muted-foreground leading-relaxed">
                Your uploaded files are sent to Google's Gemini AI service for transcription. Files are automatically 
                deleted after processing is complete. The transcription process typically takes a few minutes, after 
                which all temporary data is removed from our systems.
              </p>
            </section>

            <section>
              <h3 className="text-xl font-semibold mb-4 text-accent">No Personal Data Storage</h3>
              <p className="text-muted-foreground leading-relaxed">
                We do not collect, store, or retain any personal information. All transcription results are processed 
                in real-time and displayed directly to you. If you choose to save transcription history, it is stored 
                locally in your browser and never transmitted to our servers.
              </p>
            </section>

            <section>
              <h3 className="text-xl font-semibold mb-4 text-accent">Third-Party Services</h3>
              <p className="text-muted-foreground leading-relaxed">
                We use Google's Gemini AI for transcription services. Please refer to Google's privacy policy for 
                information about their data handling practices. Your API key is used solely for authentication 
                with Google's services and is not stored or logged by our application.
              </p>
            </section>

            <section>
              <h3 className="text-xl font-semibold mb-4 text-accent">Local Storage</h3>
              <p className="text-muted-foreground leading-relaxed">
                Our application may store preferences and settings locally in your browser using localStorage. 
                This data never leaves your device and can be cleared at any time by clearing your browser data 
                or using the settings within our application.
              </p>
            </section>

            <section>
              <h3 className="text-xl font-semibold mb-4 text-accent">Security Measures</h3>
              <p className="text-muted-foreground leading-relaxed">
                We implement industry-standard security measures to protect your data during transmission and processing. 
                All communications with our servers use HTTPS encryption, and we follow best practices for secure 
                file handling.
              </p>
            </section>

            <section>
              <h3 className="text-xl font-semibold mb-4 text-accent">Your Rights</h3>
              <p className="text-muted-foreground leading-relaxed">
                Since we don't store personal data, there's no personal information to access, modify, or delete 
                on our servers. You maintain full control over any data stored locally in your browser and can 
                clear it at any time through your browser settings or our application settings.
              </p>
            </section>

            <section>
              <h3 className="text-xl font-semibold mb-4 text-accent">Updates to This Policy</h3>
              <p className="text-muted-foreground leading-relaxed">
                We may update this privacy policy from time to time to reflect changes in our practices or for 
                legal, operational, or regulatory reasons. Any changes will be posted on this page with an updated 
                revision date.
              </p>
            </section>

            <section>
              <h3 className="text-xl font-semibold mb-4 text-accent">Contact Us</h3>
              <p className="text-muted-foreground leading-relaxed">
                If you have any questions about this privacy policy or our data practices, please contact us 
                through our support channels. We're committed to addressing any privacy concerns you may have.
              </p>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Privacy;
