
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Settings as SettingsIcon, Volume2, Palette, Globe, Shield, FileText, Download, Trash2, Moon, Sun, History, Eye, Award, Crown } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useSettings } from '../contexts/SettingsContext';
import { useTranscriptionHistory } from '../hooks/useTranscriptionHistory';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import TranscriptionSettings from '../components/TranscriptionSettings';
import AdminDashboard from '../components/AdminDashboard';

const Settings = () => {
  const { theme, toggleTheme } = useTheme();
  const { history, clearHistory } = useTranscriptionHistory();
  const { user } = useAuth();
  const {
    notifications,
    setNotifications,
    saveTranscripts,
    setSaveTranscripts,
    defaultLanguage,
    setDefaultLanguage
  } = useSettings();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Check if current user is admin
  const isAdmin = user?.email === 'legendgamerz9999@gmail.com';

  const handleClearHistory = () => {
    clearHistory();
    toast({
      title: "History cleared",
      description: "All transcription history has been removed.",
    });
  };

  const handleExportData = () => {
    const data = {
      history,
      settings: {
        theme,
        notifications,
        saveTranscripts,
        defaultLanguage
      },
      exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transcription_data_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Data exported",
      description: "Your data has been downloaded successfully.",
    });
  };

  // If admin, show admin dashboard
  if (isAdmin) {
    return <AdminDashboard />;
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2 premium-gradient bg-clip-text text-transparent">
            Settings
          </h1>
          <p className="text-muted-foreground">Customize your transcription experience</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Transcription Settings */}
          <div className="lg:col-span-2">
            <Card className="border-primary/20 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-primary">
                  <SettingsIcon className="h-5 w-5" />
                  Transcription Settings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <TranscriptionSettings />
              </CardContent>
            </Card>
          </div>

          {/* Appearance Settings */}
          <Card className="border-primary/20 shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-primary">
                <Palette className="h-5 w-5" />
                Appearance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Dark mode</p>
                  <p className="text-sm text-muted-foreground">Switch between light and dark themes</p>
                </div>
                <div className="flex items-center gap-2">
                  <Sun className="h-4 w-4 text-yellow-500" />
                  <Switch checked={theme === 'dark'} onCheckedChange={toggleTheme} />
                  <Moon className="h-4 w-4 text-blue-500" />
                </div>
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

          {/* Data & Privacy Settings */}
          <Card className="border-success/20 shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-success">
                <Shield className="h-5 w-5" />
                Data & Privacy
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Save transcripts locally</p>
                  <p className="text-sm text-muted-foreground">Keep transcription history on this device</p>
                </div>
                <Switch checked={saveTranscripts} onCheckedChange={setSaveTranscripts} />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Notifications</p>
                  <p className="text-sm text-muted-foreground">Get notified about transcription completion</p>
                </div>
                <Switch checked={notifications} onCheckedChange={setNotifications} />
              </div>

              <Separator />

              <div className="space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full justify-start hover:bg-primary/10"
                  onClick={() => navigate('/history')}
                >
                  <History className="h-4 w-4 mr-2" />
                  View Transcription History ({history.length} items)
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start hover:bg-primary/10"
                  onClick={handleExportData}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export All Data
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={handleClearHistory}
                  disabled={history.length === 0}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear All History
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* System Information */}
          <Card className="border-warning/20 shadow-lg lg:col-span-2">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-warning">
                <SettingsIcon className="h-5 w-5" />
                System Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Version:</span>
                  <span className="font-medium">2.1.0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Transcription Model:</span>
                  <span className="font-medium">Gemini 2.5 Flash</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Analysis Model:</span>
                  <span className="font-medium">Gemini 2.0 Flash-Lite</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Last Updated:</span>
                  <span className="font-medium">Today</span>
                </div>
              </div>

              <Separator />

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
