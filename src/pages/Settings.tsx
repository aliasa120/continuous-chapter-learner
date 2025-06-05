
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Settings as SettingsIcon, Volume2, Palette, Globe } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const Settings = () => {
  const [autoPlay, setAutoPlay] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [defaultLanguage, setDefaultLanguage] = useState('en');

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
              <SettingsIcon className="h-5 w-5" />
              Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Volume2 className="h-4 w-4 text-gray-600" />
                  <div>
                    <p className="text-sm font-medium">Auto-play after transcription</p>
                    <p className="text-xs text-gray-600">Automatically start playback when transcription completes</p>
                  </div>
                </div>
                <Switch checked={autoPlay} onCheckedChange={setAutoPlay} />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Palette className="h-4 w-4 text-gray-600" />
                  <div>
                    <p className="text-sm font-medium">Dark mode</p>
                    <p className="text-xs text-gray-600">Switch to dark theme</p>
                  </div>
                </div>
                <Switch checked={darkMode} onCheckedChange={setDarkMode} />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Globe className="h-4 w-4 text-gray-600" />
                  <div>
                    <p className="text-sm font-medium">Default language</p>
                    <p className="text-xs text-gray-600">Default transcription language</p>
                  </div>
                </div>
                <Select value={defaultLanguage} onValueChange={setDefaultLanguage}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="es">Spanish</SelectItem>
                    <SelectItem value="fr">French</SelectItem>
                    <SelectItem value="de">German</SelectItem>
                    <SelectItem value="it">Italian</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="border-t pt-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">About</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <p>Version: 1.0.0</p>
                <p>AI-powered transcription and translation service</p>
                <p>Built with advanced language models for accuracy</p>
              </div>
            </div>

            <div className="border-t pt-4">
              <Button variant="outline" className="w-full text-red-600 hover:text-red-700 hover:bg-red-50">
                Clear All Data
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Settings;
