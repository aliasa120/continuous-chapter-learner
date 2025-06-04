
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Play, 
  Pause, 
  Clipboard, 
  ClipboardCheck, 
  Eye,
  FileText,
  Brain,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { TranscriptionLine, ExplanationData, SummaryData } from '../types/transcription';
import { analyzeText } from '../utils/aiAnalysis';
import WordHighlight from './WordHighlight';
import { useToast } from '@/hooks/use-toast';

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
  const [easyView, setEasyView] = useState(false);
  const [copied, setCopied] = useState(false);
  const [explanations, setExplanations] = useState<Record<number, ExplanationData>>({});
  const [summaries, setSummaries] = useState<Record<number, SummaryData>>({});
  const [globalSummary, setGlobalSummary] = useState<SummaryData>({ text: '', isLoading: false });
  const [globalExplanation, setGlobalExplanation] = useState<ExplanationData>({ text: '', isLoading: false });
  const { toast } = useToast();

  const copyToClipboard = () => {
    const fullText = transcriptionLines.map(line => `${line.timestamp}: ${line.text}`).join('\n');
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAnalysis = async (index: number, type: 'explanation' | 'summary') => {
    const line = transcriptionLines[index];
    
    if (type === 'explanation') {
      setExplanations(prev => ({ ...prev, [index]: { text: '', isLoading: true } }));
    } else {
      setSummaries(prev => ({ ...prev, [index]: { text: '', isLoading: true } }));
    }

    try {
      const result = await analyzeText({ text: line.text, type });
      
      if (type === 'explanation') {
        setExplanations(prev => ({ ...prev, [index]: { text: result, isLoading: false } }));
      } else {
        setSummaries(prev => ({ ...prev, [index]: { text: result, isLoading: false } }));
      }
    } catch (error) {
      toast({
        title: "Analysis failed",
        description: "Please try again later.",
        variant: "destructive",
      });
      
      if (type === 'explanation') {
        setExplanations(prev => ({ ...prev, [index]: { text: '', isLoading: false } }));
      } else {
        setSummaries(prev => ({ ...prev, [index]: { text: '', isLoading: false } }));
      }
    }
  };

  const handleGlobalAnalysis = async (type: 'explanation' | 'summary') => {
    const fullText = transcriptionLines.map(line => line.text).join(' ');
    
    if (type === 'explanation') {
      setGlobalExplanation({ text: '', isLoading: true });
    } else {
      setGlobalSummary({ text: '', isLoading: true });
    }

    try {
      const result = await analyzeText({ text: fullText, type });
      
      if (type === 'explanation') {
        setGlobalExplanation({ text: result, isLoading: false });
      } else {
        setGlobalSummary({ text: result, isLoading: false });
      }
    } catch (error) {
      toast({
        title: "Analysis failed",
        description: "Please try again later.",
        variant: "destructive",
      });
      
      if (type === 'explanation') {
        setGlobalExplanation({ text: '', isLoading: false });
      } else {
        setGlobalSummary({ text: '', isLoading: false });
      }
    }
  };

  if (isTranscribing) {
    return (
      <div className="p-4 h-64">
        <div className="flex justify-center items-center h-full">
          <div className="text-center">
            <div className="w-10 h-10 mx-auto border-3 rounded-full border-l-green-600 border-r-green-300 border-b-green-600 border-t-green-300 animate-spin mb-3"></div>
            <p className="text-gray-900 animate-pulse text-sm font-semibold">AI Processing...</p>
            <p className="text-xs text-gray-600 mt-1">Advanced transcription with timing</p>
          </div>
        </div>
      </div>
    );
  }

  if (transcriptionLines.length === 0) {
    return (
      <div className="p-4 h-64 flex items-center justify-center text-center">
        <div className="text-gray-600">
          <div className="text-3xl mb-3">🎯</div>
          <p className="mb-1 text-sm font-medium">Transcription results will appear here</p>
          <p className="text-xs">Upload a file and start transcription</p>
        </div>
      </div>
    );
  }

  const isLineActive = (line: TranscriptionLine) => {
    return currentTime >= line.startTime && currentTime <= line.endTime;
  };

  if (easyView) {
    const fullText = transcriptionLines.map(line => line.text).join(' ');
    const allWords = transcriptionLines.flatMap(line => line.words || []);
    
    return (
      <div className="flex flex-col h-64">
        {/* Easy View Header */}
        <div className="flex justify-between items-center px-3 py-2 border-b border-gray-200 bg-blue-50">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onPlayPause} className="h-7 w-7 p-0">
              {isPlaying ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
            </Button>
            <span className="text-xs font-medium text-blue-800">Easy View</span>
          </div>
          
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleGlobalAnalysis('explanation')}
              disabled={globalExplanation.isLoading}
              className="h-7 w-7 p-0"
            >
              {globalExplanation.isLoading ? (
                <div className="w-2 h-2 border border-blue-600 border-t-transparent rounded-full animate-spin" />
              ) : (
                <Brain className="h-3 w-3 text-blue-600" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleGlobalAnalysis('summary')}
              disabled={globalSummary.isLoading}
              className="h-7 w-7 p-0"
            >
              {globalSummary.isLoading ? (
                <div className="w-2 h-2 border border-green-600 border-t-transparent rounded-full animate-spin" />
              ) : (
                <Sparkles className="h-3 w-3 text-green-600" />
              )}
            </Button>
            <Button variant="ghost" size="sm" onClick={copyToClipboard} className="h-7 w-7 p-0">
              {copied ? <ClipboardCheck className="h-3 w-3" /> : <Clipboard className="h-3 w-3" />}
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setEasyView(false)} className="h-7 w-7 p-0">
              <FileText className="h-3 w-3" />
            </Button>
          </div>
        </div>

        <ScrollArea className="flex-1 p-3">
          <div className="space-y-3">
            {/* Global Analysis Results */}
            {globalExplanation.text && (
              <Card className="border-blue-200 bg-blue-50">
                <CardContent className="p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Brain className="h-3 w-3 text-blue-600" />
                    <span className="text-xs font-medium text-blue-800">AI Explanation</span>
                  </div>
                  <p className="text-xs text-gray-700">{globalExplanation.text}</p>
                </CardContent>
              </Card>
            )}

            {globalSummary.text && (
              <Card className="border-green-200 bg-green-50">
                <CardContent className="p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="h-3 w-3 text-green-600" />
                    <span className="text-xs font-medium text-green-800">AI Summary</span>
                  </div>
                  <p className="text-xs text-gray-700">{globalSummary.text}</p>
                </CardContent>
              </Card>
            )}

            {/* Highlighted Text */}
            <div className="text-sm leading-relaxed text-gray-900">
              <WordHighlight 
                words={allWords} 
                currentTime={currentTime}
                className="leading-loose"
              />
            </div>
          </div>
        </ScrollArea>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-64">
      {/* Header */}
      <div className="flex justify-between items-center px-3 py-2 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={onPlayPause} className="h-7 w-7 p-0">
            {isPlaying ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
          </Button>
          <span className="text-xs text-gray-600">{transcriptionLines.length} segments</span>
        </div>
        
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" onClick={() => setEasyView(true)} className="h-7 w-7 p-0">
            <Eye className="h-3 w-3" />
          </Button>
          <Button variant="ghost" size="sm" onClick={copyToClipboard} className="h-7 w-7 p-0">
            {copied ? <ClipboardCheck className="h-3 w-3" /> : <Clipboard className="h-3 w-3" />}
          </Button>
        </div>
      </div>
      
      {/* Transcription Lines */}
      <ScrollArea className="flex-1 p-2">
        <div className="space-y-2">
          {transcriptionLines.map((line, index) => {
            const isActive = isLineActive(line);
            const hasExplanation = explanations[index]?.text;
            const hasSummary = summaries[index]?.text;
            
            return (
              <Card 
                key={index}
                className={`transition-all cursor-pointer ${
                  isActive 
                    ? 'border-green-500 shadow-sm bg-green-50 ring-1 ring-green-200' 
                    : 'border-gray-200 hover:border-green-300 bg-white'
                }`}
                onClick={() => seekToTimestamp(line.startTime)}
              >
                <CardContent className="p-3">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-green-700 bg-green-100 px-2 py-0.5 rounded">
                        {line.timestamp}
                      </span>
                      {line.speaker && (
                        <span className="text-xs text-blue-600 bg-blue-100 px-2 py-0.5 rounded">
                          {line.speaker}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAnalysis(index, 'explanation');
                        }}
                        disabled={explanations[index]?.isLoading}
                        className="h-6 w-6 p-0"
                      >
                        {explanations[index]?.isLoading ? (
                          <div className="w-2 h-2 border border-blue-600 border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Brain className="h-3 w-3 text-blue-600" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAnalysis(index, 'summary');
                        }}
                        disabled={summaries[index]?.isLoading}
                        className="h-6 w-6 p-0"
                      >
                        {summaries[index]?.isLoading ? (
                          <div className="w-2 h-2 border border-green-600 border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Sparkles className="h-3 w-3 text-green-600" />
                        )}
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-6 w-6 p-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          seekToTimestamp(line.startTime);
                        }}
                      >
                        <ChevronRight className="h-3 w-3 text-gray-600" />
                      </Button>
                    </div>
                  </div>
                  
                  {/* Text Content */}
                  <div className={`text-sm leading-relaxed mb-2 ${isActive ? 'font-medium text-green-900' : 'text-gray-900'}`}>
                    {line.words ? (
                      <WordHighlight words={line.words} currentTime={currentTime} />
                    ) : (
                      line.text
                    )}
                  </div>
                  
                  {/* Analysis Results */}
                  {hasExplanation && (
                    <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-xs">
                      <div className="flex items-center gap-1 mb-1">
                        <Brain className="h-3 w-3 text-blue-600" />
                        <span className="font-medium text-blue-800">Explanation</span>
                      </div>
                      <p className="text-gray-700">{explanations[index].text}</p>
                    </div>
                  )}
                  
                  {hasSummary && (
                    <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded text-xs">
                      <div className="flex items-center gap-1 mb-1">
                        <Sparkles className="h-3 w-3 text-green-600" />
                        <span className="font-medium text-green-800">Summary</span>
                      </div>
                      <p className="text-gray-700">{summaries[index].text}</p>
                    </div>
                  )}
                  
                  {/* Progress bar */}
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
    </div>
  );
};

export default MobileTranscriptionResult;
