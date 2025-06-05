
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Play, Pause, FileText, Lightbulb, BookOpen, Copy, Check } from 'lucide-react';
import WordHighlight from './WordHighlight';
import { useAIAnalysis } from '../hooks/useAIAnalysis';
import { useToast } from '@/hooks/use-toast';
import type { TranscriptionLine } from '../utils/geminiTranscription';

interface MobileTranscriptionResultProps {
  transcriptionLines: TranscriptionLine[];
  isTranscribing: boolean;
  currentTime: number;
  seekToTimestamp: (seconds: number) => void;
  isPlaying: boolean;
  onPlayPause: () => void;
}

const MobileTranscriptionResult: React.FC<MobileTranscriptionResultProps> = ({
  transcriptionLines,
  isTranscribing,
  currentTime,
  seekToTimestamp,
  isPlaying,
  onPlayPause
}) => {
  const [activeTab, setActiveTab] = useState('segments');
  const [copied, setCopied] = useState(false);
  const { generateAnalysis, isAnalyzing, analysis } = useAIAnalysis();
  const { toast } = useToast();

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({
        title: "Copied to clipboard",
        description: "Text has been copied successfully.",
      });
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Unable to copy text to clipboard.",
        variant: "destructive",
      });
    }
  };

  const handleGenerateAnalysis = async () => {
    if (transcriptionLines.length === 0) return;
    
    const fullText = transcriptionLines.map(line => line.text).join(' ');
    try {
      await generateAnalysis(fullText);
      toast({
        title: "AI Analysis Complete",
        description: "Summary and explanation have been generated.",
      });
    } catch (error) {
      toast({
        title: "Analysis failed",
        description: "Unable to generate AI analysis. Please try again.",
        variant: "destructive",
      });
    }
  };

  const isLineActive = (line: TranscriptionLine) => {
    return currentTime >= line.startTime && currentTime <= line.endTime;
  };

  const getFullTranscript = () => {
    return transcriptionLines.map(line => line.text).join(' ');
  };

  if (isTranscribing) {
    return (
      <Card className="h-96">
        <CardContent className="flex items-center justify-center h-full p-4">
          <div className="text-center">
            <div className="w-10 h-10 mx-auto border-4 rounded-full border-l-green-600 border-r-green-300 border-b-green-600 border-t-green-300 animate-spin mb-3"></div>
            <p className="text-gray-900 font-medium text-sm">AI Processing...</p>
            <p className="text-xs text-gray-600 mt-1">Enhanced transcription in progress</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (transcriptionLines.length === 0) {
    return (
      <Card className="h-96">
        <CardContent className="flex items-center justify-center h-full p-4 text-center">
          <div className="text-gray-600">
            <div className="text-3xl mb-3">🎯</div>
            <p className="mb-2 text-sm font-medium">Results will appear here</p>
            <p className="text-xs">Upload a file and start transcription</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-96">
      <CardContent className="p-0 h-full flex flex-col">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <TabsList className="grid w-full grid-cols-3 rounded-none border-b">
            <TabsTrigger value="segments" className="text-xs">
              <FileText className="h-3 w-3 mr-1" />
              Segments
            </TabsTrigger>
            <TabsTrigger value="easy" className="text-xs">
              <BookOpen className="h-3 w-3 mr-1" />
              Easy View
            </TabsTrigger>
            <TabsTrigger value="ai" className="text-xs">
              <Lightbulb className="h-3 w-3 mr-1" />
              AI Insights
            </TabsTrigger>
          </TabsList>

          <TabsContent value="segments" className="flex-1 m-0">
            <div className="flex items-center justify-between p-2 border-b bg-gray-50">
              <Button
                variant="outline"
                size="sm"
                onClick={onPlayPause}
                className="h-7 px-2"
              >
                {isPlaying ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
              </Button>
              <span className="text-xs text-gray-600">{transcriptionLines.length} segments</span>
            </div>
            
            <ScrollArea className="flex-1">
              <div className="p-2 space-y-2">
                {transcriptionLines.map((line, index) => {
                  const isActive = isLineActive(line);
                  
                  return (
                    <Card 
                      key={index}
                      className={`cursor-pointer transition-all duration-200 ${
                        isActive 
                          ? 'border-green-500 shadow-md bg-green-50 ring-1 ring-green-200' 
                          : 'border-gray-200 hover:border-green-300 hover:shadow-sm'
                      }`}
                      onClick={() => seekToTimestamp(line.startTime)}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-mono text-green-700 bg-green-100 px-2 py-1 rounded">
                              {line.timestamp}
                            </span>
                            {line.speaker && (
                              <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">
                                {line.speaker}
                              </span>
                            )}
                            {line.confidence && (
                              <span className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">
                                {line.confidence}%
                              </span>
                            )}
                          </div>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0"
                              onClick={(e) => {
                                e.stopPropagation();
                                copyToClipboard(line.text);
                              }}
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleGenerateAnalysis();
                              }}
                            >
                              <Lightbulb className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                        
                        <div className="text-sm">
                          <WordHighlight
                            text={line.text}
                            currentTime={currentTime}
                            startTime={line.startTime}
                            endTime={line.endTime}
                          />
                        </div>
                        
                        {isActive && (
                          <div className="mt-2 bg-green-200 rounded-full h-1 overflow-hidden">
                            <div 
                              className="bg-green-500 h-full transition-all duration-300"
                              style={{
                                width: `${Math.min(100, ((currentTime - line.startTime) / (line.endTime - line.startTime)) * 100)}%`
                              }}
                            />
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="easy" className="flex-1 m-0">
            <div className="flex items-center justify-between p-2 border-b bg-gray-50">
              <span className="text-sm font-medium">Full Transcript</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(getFullTranscript())}
                className="h-7 px-2"
              >
                {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
              </Button>
            </div>
            
            <ScrollArea className="flex-1">
              <div className="p-3">
                <WordHighlight
                  text={getFullTranscript()}
                  currentTime={currentTime}
                  startTime={transcriptionLines[0]?.startTime || 0}
                  endTime={transcriptionLines[transcriptionLines.length - 1]?.endTime || 0}
                />
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="ai" className="flex-1 m-0">
            <div className="flex items-center justify-between p-2 border-b bg-gray-50">
              <span className="text-sm font-medium">AI Analysis</span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleGenerateAnalysis}
                disabled={isAnalyzing || transcriptionLines.length === 0}
                className="h-7 px-2"
              >
                {isAnalyzing ? (
                  <div className="w-3 h-3 border-2 border-t-transparent border-gray-600 rounded-full animate-spin" />
                ) : (
                  <Lightbulb className="h-3 w-3" />
                )}
              </Button>
            </div>
            
            <ScrollArea className="flex-1">
              <div className="p-3 space-y-4">
                {analysis ? (
                  <>
                    <div>
                      <h4 className="text-sm font-semibold text-green-700 mb-2 flex items-center">
                        <BookOpen className="h-3 w-3 mr-1" />
                        Summary
                      </h4>
                      <p className="text-sm text-gray-700 leading-relaxed">{analysis.summary}</p>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-semibold text-blue-700 mb-2 flex items-center">
                        <Lightbulb className="h-3 w-3 mr-1" />
                        Explanation
                      </h4>
                      <p className="text-sm text-gray-700 leading-relaxed">{analysis.explanation}</p>
                    </div>
                  </>
                ) : (
                  <div className="text-center text-gray-500">
                    <Lightbulb className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm">Generate AI analysis to see insights</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default MobileTranscriptionResult;
