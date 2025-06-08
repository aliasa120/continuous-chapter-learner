
import React from 'react';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Palette, Volume2, Eye } from 'lucide-react';
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
    <div className="space-y-4">
      {/* Playback Settings */}
      <Card className="border-primary/10 bg-primary/5">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2 text-primary">
            <Volume2 className="h-4 w-4" />
            Playback
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <Label htmlFor="auto-play" className="text-sm text-foreground">Auto Play</Label>
            <Switch
              id="auto-play"
              checked={autoPlay}
              onCheckedChange={setAutoPlay}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="auto-scroll" className="text-sm text-foreground">Auto Scroll</Label>
            <Switch
              id="auto-scroll"
              checked={autoScroll}
              onCheckedChange={setAutoScroll}
            />
          </div>
          <div className="space-y-2">
            <Label className="text-sm text-foreground">Timestamp Player Mode</Label>
            <Select value={timestampPlayerMode} onValueChange={setTimestampPlayerMode}>
              <SelectTrigger className="w-full">
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
      <Card className="border-secondary/10 bg-secondary/5">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2 text-secondary">
            <Eye className="h-4 w-4" />
            Display
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <Label htmlFor="show-confidence" className="text-sm text-foreground">Show Confidence</Label>
            <Switch
              id="show-confidence"
              checked={showConfidence}
              onCheckedChange={setShowConfidence}
            />
          </div>
        </CardContent>
      </Card>

      {/* Word Highlighting */}
      <Card className="border-accent/10 bg-accent/5">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2 text-accent">
            <Palette className="h-4 w-4" />
            Word Highlighting
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <Label className="text-sm text-foreground">Highlight Color</Label>
            <Select value={wordHighlightColor} onValueChange={setWordHighlightColor}>
              <SelectTrigger className="w-full">
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
            <Label className="text-sm text-foreground">Highlight Opacity ({wordHighlightOpacity}%)</Label>
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
            <Label className="text-sm text-foreground">Animation Style</Label>
            <Select value={wordHighlightAnimation} onValueChange={setWordHighlightAnimation}>
              <SelectTrigger className="w-full">
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
