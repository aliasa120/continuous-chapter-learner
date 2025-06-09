
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { exportFormats, exportTranscription, type ExportFormat } from '../utils/exportFormats';
import { useSettings } from '../contexts/SettingsContext';
import type { TranscriptionLine } from '../utils/geminiTranscription';
import { Download, FileText, Film, Code, Table } from 'lucide-react';

interface ExportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  transcriptionLines: TranscriptionLine[];
  filename?: string;
}

const ExportDialog: React.FC<ExportDialogProps> = ({
  isOpen,
  onClose,
  transcriptionLines,
  filename = 'transcription'
}) => {
  const { defaultExportFormat, setDefaultExportFormat, showExportDialog, setShowExportDialog } = useSettings();
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>(defaultExportFormat as ExportFormat);
  const [rememberChoice, setRememberChoice] = useState(false);
  const [dontShowAgain, setDontShowAgain] = useState(false);

  const getFormatIcon = (format: string) => {
    switch (format) {
      case 'txt': return <FileText className="h-4 w-4" />;
      case 'srt':
      case 'vtt': return <Film className="h-4 w-4" />;
      case 'json': return <Code className="h-4 w-4" />;
      case 'csv': return <Table className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const handleExport = () => {
    exportTranscription(transcriptionLines, selectedFormat, filename);
    
    if (rememberChoice) {
      setDefaultExportFormat(selectedFormat);
    }
    
    if (dontShowAgain) {
      setShowExportDialog(false);
    }
    
    onClose();
  };

  const handleQuickExport = (format: ExportFormat) => {
    setSelectedFormat(format);
    exportTranscription(transcriptionLines, format, filename);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Export Transcription
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="space-y-3">
            <Label htmlFor="format">Export Format</Label>
            <Select value={selectedFormat} onValueChange={(value) => setSelectedFormat(value as ExportFormat)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {exportFormats.map((format) => (
                  <SelectItem key={format.value} value={format.value}>
                    <div className="flex items-center gap-2">
                      {getFormatIcon(format.value)}
                      <div>
                        <div className="font-medium">{format.label}</div>
                        <div className="text-xs text-muted-foreground">{format.description}</div>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <Label>Quick Export</Label>
            <div className="grid grid-cols-2 gap-2">
              {exportFormats.slice(0, 4).map((format) => (
                <Button
                  key={format.value}
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickExport(format.value as ExportFormat)}
                  className="justify-start"
                >
                  {getFormatIcon(format.value)}
                  <span className="ml-2">{format.value.toUpperCase()}</span>
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="remember"
                checked={rememberChoice}
                onCheckedChange={(checked) => setRememberChoice(checked as boolean)}
              />
              <Label htmlFor="remember" className="text-sm">
                Remember this format as default
              </Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="dontShow"
                checked={dontShowAgain}
                onCheckedChange={(checked) => setDontShowAgain(checked as boolean)}
              />
              <Label htmlFor="dontShow" className="text-sm">
                Don't show this dialog again (use default format)
              </Label>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export {selectedFormat.toUpperCase()}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ExportDialog;
