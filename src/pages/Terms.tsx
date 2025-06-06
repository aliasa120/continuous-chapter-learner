
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, FileText } from 'lucide-react';

const Terms = () => {
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
              <FileText className="h-6 w-6" />
              Terms of Service
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-8 text-foreground">
            <section>
              <h3 className="text-xl font-semibold mb-4 text-accent">1. Service Description</h3>
              <p className="text-muted-foreground leading-relaxed">
                Our AI-powered transcription service converts audio and video files into text format using advanced 
                machine learning technology. The service is provided "as-is" for personal and commercial use.
              </p>
            </section>

            <section>
              <h3 className="text-xl font-semibold mb-4 text-accent">2. User Responsibilities</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li>• You must have the right to transcribe the content you upload</li>
                <li>• You are responsible for the accuracy and legality of your files</li>
                <li>• You must not upload content that violates copyright or privacy laws</li>
                <li>• You must provide your own valid API key for the transcription service</li>
              </ul>
            </section>

            <section>
              <h3 className="text-xl font-semibold mb-4 text-accent">3. File Processing</h3>
              <p className="text-muted-foreground leading-relaxed">
                Files uploaded to our service are processed temporarily and are automatically deleted after 
                transcription completion. We do not permanently store your files or transcription results 
                unless you explicitly save them locally.
              </p>
            </section>

            <section>
              <h3 className="text-xl font-semibold mb-4 text-accent">4. API Usage</h3>
              <p className="text-muted-foreground leading-relaxed">
                Our service uses Google's Gemini AI API for transcription. By using our service, you acknowledge 
                that your files will be processed by Google's services according to their terms and privacy policies.
              </p>
            </section>

            <section>
              <h3 className="text-xl font-semibold mb-4 text-accent">5. Accuracy Disclaimer</h3>
              <p className="text-muted-foreground leading-relaxed">
                While we strive for high accuracy, transcription results are not guaranteed to be 100% accurate. 
                Factors such as audio quality, background noise, and speech clarity can affect transcription quality.
              </p>
            </section>

            <section>
              <h3 className="text-xl font-semibold mb-4 text-accent">6. Service Availability</h3>
              <p className="text-muted-foreground leading-relaxed">
                We aim to provide reliable service but cannot guarantee 100% uptime. The service may be temporarily 
                unavailable for maintenance, updates, or due to factors beyond our control.
              </p>
            </section>

            <section>
              <h3 className="text-xl font-semibold mb-4 text-accent">7. Limitation of Liability</h3>
              <p className="text-muted-foreground leading-relaxed">
                Our liability is limited to the extent permitted by law. We are not responsible for any damages 
                arising from the use of our service, including but not limited to data loss or transcription errors.
              </p>
            </section>

            <section>
              <h3 className="text-xl font-semibold mb-4 text-accent">8. Changes to Terms</h3>
              <p className="text-muted-foreground leading-relaxed">
                We reserve the right to modify these terms at any time. Continued use of the service after 
                changes constitutes acceptance of the new terms.
              </p>
            </section>

            <section>
              <h3 className="text-xl font-semibold mb-4 text-accent">9. Contact Information</h3>
              <p className="text-muted-foreground leading-relaxed">
                If you have any questions about these terms, please contact us through our support channels.
              </p>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Terms;
