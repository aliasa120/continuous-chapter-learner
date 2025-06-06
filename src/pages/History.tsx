
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { History as HistoryIcon, Search, Download, Trash2, Clock, FileAudio, Filter } from 'lucide-react';
import { useTranscriptionHistory } from '../hooks/useTranscriptionHistory';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

const History = () => {
  const { history, clearHistory, removeFromHistory } = useTranscriptionHistory();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('all');

  const filteredHistory = history.filter(item => {
    const matchesSearch = item.fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.transcription.some(line => line.text.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesLanguage = selectedLanguage === 'all' || item.language === selectedLanguage;
    return matchesSearch && matchesLanguage;
  });

  const exportTranscription = (item: any) => {
    const text = item.transcription.map((line: any) => line.text).join(' ');
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${item.fileName}_transcription.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Export successful",
      description: "Transcription has been downloaded.",
    });
  };

  const handleDelete = (id: string) => {
    removeFromHistory(id);
    toast({
      title: "Item deleted",
      description: "Transcription has been removed from history.",
    });
  };

  const handleClearAll = () => {
    clearHistory();
    toast({
      title: "History cleared",
      description: "All transcription history has been removed.",
    });
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const uniqueLanguages = Array.from(new Set(history.map(item => item.language)));

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 py-6">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Transcription History
          </h1>
          <p className="text-muted-foreground">View and manage your past transcriptions</p>
        </div>

        {/* Controls */}
        <Card className="mb-6 border-primary/20 shadow-lg bg-card/50 backdrop-blur">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4 items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search transcriptions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-primary/20 focus:border-primary"
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <select
                  value={selectedLanguage}
                  onChange={(e) => setSelectedLanguage(e.target.value)}
                  className="px-3 py-2 rounded-md border border-primary/20 bg-background text-foreground focus:border-primary"
                >
                  <option value="all">All Languages</option>
                  {uniqueLanguages.map(lang => (
                    <option key={lang} value={lang}>{lang.toUpperCase()}</option>
                  ))}
                </select>
              </div>
              {history.length > 0 && (
                <Button
                  variant="destructive"
                  onClick={handleClearAll}
                  className="bg-destructive hover:bg-destructive/90"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear All
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        {history.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card className="border-primary/20 shadow-lg bg-card/50 backdrop-blur">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-primary">{history.length}</div>
                <div className="text-sm text-muted-foreground">Total Transcriptions</div>
              </CardContent>
            </Card>
            <Card className="border-accent/20 shadow-lg bg-card/50 backdrop-blur">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-accent">{uniqueLanguages.length}</div>
                <div className="text-sm text-muted-foreground">Languages Used</div>
              </CardContent>
            </Card>
            <Card className="border-primary/20 shadow-lg bg-card/50 backdrop-blur">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-primary">
                  {Math.round(history.reduce((acc, item) => acc + (item.duration || 0), 0) / 60)}m
                </div>
                <div className="text-sm text-muted-foreground">Total Duration</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* History List */}
        {filteredHistory.length === 0 ? (
          <Card className="border-primary/20 shadow-lg bg-card/50 backdrop-blur">
            <CardContent className="p-12 text-center">
              <HistoryIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2 text-foreground">
                {history.length === 0 ? 'No transcriptions yet' : 'No results found'}
              </h3>
              <p className="text-muted-foreground">
                {history.length === 0 
                  ? 'Start transcribing files to see them here'
                  : 'Try adjusting your search criteria'
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredHistory.map((item) => (
              <Card key={item.id} className="border-primary/20 shadow-lg hover:shadow-xl transition-all bg-card/50 backdrop-blur">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-lg text-foreground">
                      <FileAudio className="h-5 w-5 text-primary" />
                      {item.fileName}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="bg-primary/10 text-primary">
                        {item.language.toUpperCase()}
                      </Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => exportTranscription(item)}
                        className="border-accent text-accent hover:bg-accent/10"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(item.id)}
                        className="border-destructive text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {format(new Date(item.timestamp), 'MMM dd, yyyy HH:mm')}
                    </div>
                    {item.duration && (
                      <div className="flex items-center gap-1">
                        <FileAudio className="h-4 w-4" />
                        {formatDuration(item.duration)}
                      </div>
                    )}
                    <Badge variant="outline" className="border-primary/30 text-primary">
                      {item.transcription.length} segments
                    </Badge>
                  </div>
                  <Separator className="mb-3" />
                  <div className="text-sm text-foreground leading-relaxed max-h-24 overflow-hidden">
                    {item.transcription.slice(0, 3).map((line, index) => (
                      <span key={index}>{line.text} </span>
                    ))}
                    {item.transcription.length > 3 && (
                      <span className="text-muted-foreground">...</span>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default History;
