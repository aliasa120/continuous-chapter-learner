
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Home, ArrowLeft } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 flex items-center justify-center">
      <div className="container mx-auto px-4 max-w-2xl text-center">
        <Card className="border-primary/20 shadow-2xl bg-card/80 backdrop-blur">
          <CardContent className="p-12">
            <div className="mb-8">
              <div className="text-8xl md:text-9xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-4">
                404
              </div>
              <h1 className="text-2xl md:text-3xl font-bold mb-4 text-foreground">
                Oops! Page not found
              </h1>
              <p className="text-lg text-muted-foreground mb-8 max-w-md mx-auto">
                The page you're looking for doesn't exist or has been moved to a different location.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground px-8">
                <Link to="/">
                  <Home className="h-4 w-4 mr-2" />
                  Go Home
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="border-accent text-accent hover:bg-accent/10 px-8">
                <Link to="/transcribe">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Start Transcribing
                </Link>
              </Button>
            </div>

            <div className="mt-8 p-4 bg-primary/5 rounded-lg border border-primary/20">
              <p className="text-sm text-muted-foreground">
                If you believe this is an error, please contact our support team.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default NotFound;
