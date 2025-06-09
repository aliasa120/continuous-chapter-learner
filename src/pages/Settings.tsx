import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  Settings as SettingsIcon, 
  Play, 
  Eye, 
  Palette, 
  Languages, 
  Database, 
  Zap,
  Download,
  HardDrive,
  Clock
} from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';
import { useToast } from '@/hooks/use-toast';
import { exportFormats } from '../utils/exportFormats';
import LanguageSelector from '../components/LanguageSelector';

const Settings = () => {
  const {
    autoPlay, setAutoPlay,
    autoScroll, setAutoScroll,
    showConfidence, setShowConfidence,
    defaultLanguage, setDefaultLanguage,
    notifications, setNotifications,
    saveTranscripts, setSaveTranscripts,
    wordHighlightColor, setWordHighlightColor,
    wordHighlightOpacity, setWordHighlightOpacity,
    wordHighlightAnimation, setWordHighlightAnimation,
    timestampPlayerMode, setTimestampPlayerMode,
    defaultExportFormat, setDefaultExportFormat,
    showExportDialog, setShowExportDialog,
    maxFileSize, setMaxFileSize,
    maxDuration, setMaxDuration
  } = useSettings();
  
  const { toast } = useToast();

  const resetSettings = () => {
    setAutoPlay(false);
    setAutoScroll(true);
    setShowConfidence(true);
    setDefaultLanguage('en');
    setNotifications(true);
    setSaveTranscripts(true);
    setWordHighlightColor('primary');
    setWordHighlightOpacity(80);
    setWordHighlightAnimation('pulse');
    setTimestampPlayerMode('segment');
    setDefaultExportFormat('txt');
    setShowExportDialog(true);
    setMaxFileSize(2048);
    setMaxDuration(3600);
    
    toast({
      title: "Settings Reset",
      description: "All settings have been restored to their default values.",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 py-4 sm:py-6">
      <div className="container mx-auto px-3 sm:px-4 max-w-4xl">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent flex items-center gap-3">
            <SettingsIcon className="h-8 w-8 text-primary" />
            Settings
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            Customize your transcription experience and preferences
          </p>
        </div>

        <div className="grid gap-6">
          {/* Playback Settings */}
          <Card className="border-primary/20 shadow-lg bg-card backdrop-blur">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-primary">
                <Play className="h-5 w-5" />
                Playback Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="auto-play">Auto-play on timestamp click</Label>
                  <p className="text-xs text-muted-foreground">
                    Automatically start playback when clicking on timestamps
                  </p>
                </div>
                <Switch
                  id="auto-play"
                  checked={autoPlay}
                  onCheckedChange={setAutoPlay}
                />
              </div>

              <div className="space-y-3">
                <Label>Timestamp Player Mode</Label>
                <Select value={timestampPlayerMode} onValueChange={setTimestampPlayerMode}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="segment">Play Segment Only</SelectItem>
                    <SelectItem value="continuous">Play from Timestamp</SelectItem>
                    <SelectItem value="loop">Loop Segment</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Choose how timestamp clicks behave in the player
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Display Settings */}
          <Card className="border-secondary/20 shadow-lg bg-card backdrop-blur">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-secondary">
                <Eye className="h-5 w-5" />
                Display Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="auto-scroll">Auto-scroll to active line</Label>
                  <p className="text-xs text-muted-foreground">
                    Automatically scroll to the currently playing line
                  </p>
                </div>
                <Switch
                  id="auto-scroll"
                  checked={autoScroll}
                  onCheckedChange={setAutoScroll}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="show-confidence">Show confidence scores</Label>
                  <p className="text-xs text-muted-foreground">
                    Display confidence percentages for each segment
                  </p>
                </div>
                <Switch
                  id="show-confidence"
                  checked={showConfidence}
                  onCheckedChange={setShowConfidence}
                />
              </div>
            </CardContent>
          </Card>

          {/* Word Highlighting */}
          <Card className="border-accent/20 shadow-lg bg-card backdrop-blur">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-accent">
                <Palette className="h-5 w-5" />
                Word Highlighting
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Label>Highlight Color</Label>
                <Select value={wordHighlightColor} onValueChange={setWordHighlightColor}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="primary">Primary</SelectItem>
                    <SelectItem value="secondary">Secondary</SelectItem>
                    <SelectItem value="accent">Accent</SelectItem>
                    <SelectItem value="success">Success</SelectItem>
                    <SelectItem value="warning">Warning</SelectItem>
                    <SelectItem value="destructive">Destructive</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label>Highlight Opacity: {wordHighlightOpacity}%</Label>
                <Slider
                  value={[wordHighlightOpacity]}
                  onValueChange={(value) => setWordHighlightOpacity(value[0])}
                  max={100}
                  min={10}
                  step={10}
                  className="w-full"
                />
              </div>

              <div className="space-y-3">
                <Label>Animation Style</Label>
                <Select value={wordHighlightAnimation} onValueChange={setWordHighlightAnimation}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="pulse">Pulse</SelectItem>
                    <SelectItem value="glow">Glow</SelectItem>
                    <SelectItem value="bounce">Bounce</SelectItem>
                    <SelectItem value="fade">Fade</SelectItem>
                    <SelectItem value="scale">Scale</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Export Settings */}
          <Card className="border-green-500/20 shadow-lg bg-card backdrop-blur">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-green-500">
                <Download className="h-5 w-5" />
                Export Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Label>Default Export Format</Label>
                <Select value={defaultExportFormat} onValueChange={setDefaultExportFormat}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {exportFormats.map((format) => (
                      <SelectItem key={format.value} value={format.value}>
                        <div>
                          <div className="font-medium">{format.label}</div>
                          <div className="text-xs text-muted-foreground">{format.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="show-export-dialog">Show export format dialog</Label>
                  <p className="text-xs text-muted-foreground">
                    Show format selection dialog when exporting
                  </p>
                </div>
                <Switch
                  id="show-export-dialog"
                  checked={showExportDialog}
                  onCheckedChange={setShowExportDialog}
                />
              </div>
            </CardContent>
          </Card>

          {/* File Limits */}
          <Card className="border-orange-500/20 shadow-lg bg-card backdrop-blur">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-orange-500">
                <HardDrive className="h-5 w-5" />
                File Limits
                <Badge variant="secondary" className="text-xs">Gemini 2.5 Flash</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Label>Maximum File Size (MB): {maxFileSize}</Label>
                <Slider
                  value={[maxFileSize]}
                  onValueChange={(value) => setMaxFileSize(value[0])}
                  max={2048}
                  min={50}
                  step={50}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">
                  Gemini 2.5 Flash supports up to 2GB per file
                </p>
              </div>

              <div className="space-y-3">
                <Label>Maximum Duration (minutes): {Math.floor(maxDuration / 60)}</Label>
                <Slider
                  value={[maxDuration]}
                  onValueChange={(value) => setMaxDuration(value[0])}
                  max={10800} // 3 hours
                  min={300} // 5 minutes
                  step={300} // 5 minute steps
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">
                  Up to 1 hour at default resolution, 3 hours at low resolution
                </p>
              </div>

              <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
                  Supported Formats
                </h4>
                <div className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
                  <div><strong>Video:</strong> MP4, MPEG, MOV, AVI, FLV, MPG, WEBM, WMV, 3GPP</div>
                  <div><strong>Audio:</strong> WAV, MP3, AIFF, AAC, OGG Vorbis, FLAC</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Language & Audio Settings */}
          <Card className="border-blue-500/20 shadow-lg bg-card backdrop-blur">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-blue-500">
                <Languages className="h-5 w-5" />
                Language & Audio
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Label>Default Language</Label>
                <LanguageSelector language={defaultLanguage} setLanguage={setDefaultLanguage} />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="notifications">Enable notifications</Label>
                  <p className="text-xs text-muted-foreground">
                    Show completion notifications for transcriptions
                  </p>
                </div>
                <Switch
                  id="notifications"
                  checked={notifications}
                  onCheckedChange={setNotifications}
                />
              </div>
            </CardContent>
          </Card>

          {/* Data & History */}
          <Card className="border-purple-500/20 shadow-lg bg-card backdrop-blur">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-purple-500">
                <Database className="h-5 w-5" />
                Data & History
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="save-transcripts">Save transcripts locally</Label>
                  <p className="text-xs text-muted-foreground">
                    Automatically save completed transcriptions to history
                  </p>
                </div>
                <Switch
                  id="save-transcripts"
                  checked={saveTranscripts}
                  onCheckedChange={setSaveTranscripts}
                />
              </div>
            </CardContent>
          </Card>

          {/* Advanced */}
          <Card className="border-red-500/20 shadow-lg bg-card backdrop-blur">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-red-500">
                <Zap className="h-5 w-5" />
                Advanced
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button 
                  variant="destructive" 
                  onClick={resetSettings}
                  className="w-full"
                >
                  Reset All Settings
                </Button>
                <p className="text-xs text-muted-foreground text-center">
                  This will restore all settings to their default values
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Settings;
