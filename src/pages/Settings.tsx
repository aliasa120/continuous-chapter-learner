
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Settings as SettingsIcon, Volume2, Palette, Globe, Shield, FileText, Download, Trash2 } from 'lucide-react';

const Settings = () => {
  const [autoPlay, setAutoPlay] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [defaultLanguage, setDefaultLanguage] = useState('en');
  const [notifications, setNotifications] = useState(true);
  const [saveTranscripts, setSaveTranscripts] = useState(true);

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold mb-2 bg-gradient-to-r from-green-600 to-emerald-500 bg-clip-text text-transparent">
            Settings
          </h1>
          <p className="text-gray-600">Customize your transcription experience</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Audio & Playback Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-700">
                <Volume2 className="h-5 w-5" />
                Audio & Playback
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Auto-play after transcription</p>
                  <p className="text-sm text-gray-600">Automatically start playback when transcription completes</p>
                </div>
                <Switch checked={autoPlay} onCheckedChange={setAutoPlay} />
              </div>

              <Separator />

              <div className="space-y-2">
                <label className="font-medium">Default transcription language</label>
                <Select value={defaultLanguage} onValueChange={setDefaultLanguage}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="es">Spanish</SelectItem>
                    <SelectItem value="fr">French</SelectItem>
                    <SelectItem value="de">German</SelectItem>
                    <SelectItem value="it">Italian</SelectItem>
                    <SelectItem value="pt">Portuguese</SelectItem>
                    <SelectItem value="zh">Chinese</SelectItem>
                    <SelectItem value="ja">Japanese</SelectItem>
                    <SelectItem value="ko">Korean</SelectItem>
                    <SelectItem value="ar">Arabic</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Interface Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-700">
                <Palette className="h-5 w-5" />
                Interface
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Dark mode</p>
                  <p className="text-sm text-gray-600">Switch to dark theme</p>
                </div>
                <Switch checked={darkMode} onCheckedChange={setDarkMode} />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Notifications</p>
                  <p className="text-sm text-gray-600">Get notified about transcription completion</p>
                </div>
                <Switch checked={notifications} onCheckedChange={setNotifications} />
              </div>
            </CardContent>
          </Card>

          {/* Privacy & Data Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-purple-700">
                <Shield className="h-5 w-5" />
                Privacy & Data
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Save transcripts locally</p>
                  <p className="text-sm text-gray-600">Keep transcription history on this device</p>
                </div>
                <Switch checked={saveTranscripts} onCheckedChange={setSaveTranscripts} />
              </div>

              <Separator />

              <div className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <Download className="h-4 w-4 mr-2" />
                  Export All Data
                </Button>
                <Button variant="outline" className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear All Data
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* App Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-700">
                <SettingsIcon className="h-5 w-5" />
                About
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Version:</span>
                  <span className="font-medium">2.1.0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">AI Model:</span>
                  <span className="font-medium">Gemini 2.0 Flash-Lite</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Last Updated:</span>
                  <span className="font-medium">Today</span>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <p className="text-sm text-gray-600">
                  AI-powered transcription and translation service with advanced language support and real-time processing.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" size="sm" className="text-xs">
                  <FileText className="h-3 w-3 mr-1" />
                  Release Notes
                </Button>
                <Button variant="outline" size="sm" className="text-xs">
                  <Globe className="h-3 w-3 mr-1" />
                  Support
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Settings;
