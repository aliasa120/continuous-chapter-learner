
import React from 'react';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Palette, Volume2, Eye, Zap } from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';

const TranscriptionSettings: React.FC = () => {
  const { 
    autoPlay, setAutoPlay,
    autoScroll, setAutoScroll,
    showConfidence, setShowConfidence,
    wordHighlightColor, setWordHighlightColor,
    wordHighlightOpacity, setWordHighlightOpacity,
    wordHighlightAnimation, setWordHighlightAnimation,
    timestampPlayerMode, setTimestampPlayerMode
  } = useSettings();

  return (
    <div className="space-y-6">
      {/* Playback Settings */}
      <Card className="border-primary/20 shadow-lg bg-card/50 backdrop-blur">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-primary">
            <Volume2 className="h-5 w-5" />
            Playback Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-foreground">Auto Play</Label>
              <p className="text-sm text-muted-foreground">Automatically play audio when clicking timestamps</p>
            </div>
            <Switch checked={autoPlay} onCheckedChange={setAutoPlay} />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-foreground">Auto Scroll</Label>
              <p className="text-sm text-muted-foreground">Automatically scroll to active transcript segment</p>
            </div>
            <Switch checked={autoScroll} onCheckedChange={setAutoScroll} />
          </div>
          
          <div className="space-y-2">
            <Label className="text-foreground">Timestamp Player Mode</Label>
            <p className="text-sm text-muted-foreground">Control how timestamp clicking behaves</p>
            <Select value={timestampPlayerMode} onValueChange={setTimestampPlayerMode}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="segment">Play Segment Only</SelectItem>
                <SelectItem value="continuous">Play Continuously</SelectItem>
                <SelectItem value="loop">Loop Segment</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Display Settings */}
      <Card className="border-primary/20 shadow-lg bg-card/50 backdrop-blur">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-primary">
            <Eye className="h-5 w-5" />
            Display Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-foreground">Show Confidence Scores</Label>
              <p className="text-sm text-muted-foreground">Display AI confidence percentages for each segment</p>
            </div>
            <Switch checked={showConfidence} onCheckedChange={setShowConfidence} />
          </div>
        </CardContent>
      </Card>

      {/* Word Highlighting */}
      <Card className="border-primary/20 shadow-lg bg-card/50 backdrop-blur">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-primary">
            <Palette className="h-5 w-5" />
            Word Highlighting
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="text-foreground">Highlight Color</Label>
            <p className="text-sm text-muted-foreground">Choose the color for word highlighting</p>
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
          
          <div className="space-y-2">
            <Label className="text-foreground">Highlight Opacity ({wordHighlightOpacity}%)</Label>
            <p className="text-sm text-muted-foreground">Adjust the transparency of word highlights</p>
            <Slider
              value={[wordHighlightOpacity]}
              onValueChange={(value) => setWordHighlightOpacity(value[0])}
              max={100}
              min={10}
              step={10}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-foreground">Animation Style</Label>
            <p className="text-sm text-muted-foreground">Choose the animation effect for word highlighting</p>
            <Select value={wordHighlightAnimation} onValueChange={setWordHighlightAnimation}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pulse">Pulse</SelectItem>
                <SelectItem value="glow">Glow</SelectItem>
                <SelectItem value="bounce">Bounce</SelectItem>
                <SelectItem value="fade">Fade</SelectItem>
                <SelectItem value="scale">Scale</SelectItem>
                <SelectItem value="none">None</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TranscriptionSettings;
