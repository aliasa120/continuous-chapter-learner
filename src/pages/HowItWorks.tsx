
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Upload, Cpu, Download, Shield, Zap, Globe } from 'lucide-react';

const HowItWorks = () => {
  const steps = [
    {
      number: "01",
      icon: Upload,
      title: "Upload Your File",
      description: "Simply drag and drop your audio or video file. We support MP3, WAV, MP4, and many other formats.",
      color: "text-primary"
    },
    {
      number: "02",
      icon: Cpu,
      title: "AI Processing",
      description: "Our advanced Gemini AI analyzes your content and converts speech to text with high accuracy.",
      color: "text-accent"
    },
    {
      number: "03",
      icon: Download,
      title: "Get Results",
      description: "Receive your transcription with timestamps, speaker identification, and export options.",
      color: "text-primary"
    }
  ];

  const features = [
    {
      icon: Shield,
      title: "Privacy & Security",
      description: "Your files are processed securely and never permanently stored on our servers.",
      gradient: "from-primary/20 to-primary/10"
    },
    {
      icon: Zap,
      title: "Lightning Fast",
      description: "Get your transcriptions in minutes, not hours. Our AI processes files quickly and efficiently.",
      gradient: "from-accent/20 to-accent/10"
    },
    {
      icon: Globe,
      title: "Multi-Language Support",
      description: "Support for 10+ languages including English, Spanish, French, German, and more.",
      gradient: "from-primary/20 to-accent/10"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 py-6">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="mb-6">
          <Button asChild variant="ghost" className="text-primary hover:bg-primary/10">
            <Link to="/">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Link>
          </Button>
        </div>

        <div className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            How It Works
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Transform your audio and video files into accurate transcriptions in just three simple steps
          </p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {steps.map((step, index) => (
            <Card key={index} className="border-primary/20 shadow-lg hover:shadow-xl transition-all bg-card/50 backdrop-blur relative overflow-hidden">
              <div className="absolute top-4 right-4 text-6xl font-bold text-primary/10">
                {step.number}
              </div>
              <CardHeader className="pb-4">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${index % 2 === 0 ? 'from-primary/20 to-primary/10' : 'from-accent/20 to-accent/10'} flex items-center justify-center mb-4`}>
                  <step.icon className={`h-6 w-6 ${step.color}`} />
                </div>
                <CardTitle className="text-xl text-foreground">{step.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">{step.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Features */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold mb-8 text-center text-foreground">Why Choose Our Platform?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="border-primary/20 shadow-lg hover:shadow-xl transition-all bg-card/50 backdrop-blur">
                <CardHeader className="pb-4">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4`}>
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl text-foreground">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Technical Details */}
        <Card className="mb-16 border-primary/20 shadow-lg bg-card/50 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-2xl text-center text-foreground">Technical Specifications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="font-semibold text-lg mb-4 text-primary">Supported Formats</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• Audio: MP3, WAV, FLAC, AAC, OGG</li>
                  <li>• Video: MP4, AVI, MOV, WMV, MKV</li>
                  <li>• Maximum file size: 200MB</li>
                  <li>• Maximum duration: 2 hours</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-4 text-accent">AI Technology</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• Google Gemini AI for transcription</li>
                  <li>• Advanced speech recognition</li>
                  <li>• Automatic punctuation and formatting</li>
                  <li>• Speaker identification (coming soon)</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CTA */}
        <div className="text-center bg-gradient-to-r from-primary/10 to-accent/10 rounded-2xl p-12 border border-primary/20">
          <h2 className="text-3xl font-bold mb-4 text-foreground">Ready to Get Started?</h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Upload your first file and experience the power of AI transcription
          </p>
          <Button asChild size="lg" className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white px-12 py-6 text-lg rounded-xl shadow-lg">
            <Link to="/transcribe">
              Start Transcribing Now
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default HowItWorks;
