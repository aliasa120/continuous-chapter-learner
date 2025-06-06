
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mic, FileAudio, Zap, Shield, Clock, Globe } from 'lucide-react';

const Home = () => {
  const features = [
    {
      icon: Mic,
      title: "Real-time Transcription",
      description: "Convert speech to text instantly with AI-powered accuracy",
      color: "text-primary"
    },
    {
      icon: FileAudio,
      title: "Multiple Formats",
      description: "Support for audio and video files in various formats",
      color: "text-accent"
    },
    {
      icon: Zap,
      title: "Lightning Fast",
      description: "Get your transcriptions in seconds, not minutes",
      color: "text-primary"
    },
    {
      icon: Shield,
      title: "Privacy First",
      description: "Your files are processed securely and never stored",
      color: "text-accent"
    },
    {
      icon: Clock,
      title: "Timestamp Sync",
      description: "Perfect synchronization with audio playback",
      color: "text-primary"
    },
    {
      icon: Globe,
      title: "Multi-language",
      description: "Support for 10+ languages and dialects",
      color: "text-accent"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <div className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="mb-8">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              AI-Powered Transcription
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Transform your audio and video content into accurate, searchable text with our advanced AI technology
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-6 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all">
              <Link to="/transcribe">
                <Mic className="mr-2 h-5 w-5" />
                Start Transcribing
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="border-primary text-primary hover:bg-primary/10 px-8 py-6 text-lg rounded-xl">
              <Link to="/how-it-works">
                Learn More
              </Link>
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {features.map((feature, index) => (
            <Card key={index} className="border-primary/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-card/50 backdrop-blur">
              <CardHeader className="pb-4">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mb-4`}>
                  <feature.icon className={`h-6 w-6 ${feature.color}`} />
                </div>
                <CardTitle className="text-xl text-foreground">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Stats Section */}
        <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-2xl p-8 mb-16 border border-primary/20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-3xl md:text-4xl font-bold text-primary mb-2">99%</div>
              <div className="text-muted-foreground">Accuracy Rate</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-accent mb-2">10+</div>
              <div className="text-muted-foreground">Languages Supported</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-primary mb-2">1M+</div>
              <div className="text-muted-foreground">Files Processed</div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center bg-gradient-to-r from-primary/5 to-accent/5 rounded-2xl p-12 border border-primary/20">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
            Ready to get started?
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Upload your first file and experience the power of AI transcription
          </p>
          <Button asChild size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground px-12 py-6 text-lg rounded-xl shadow-lg">
            <Link to="/transcribe">
              Try It Now
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Home;
