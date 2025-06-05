
import React from 'react';
import { Button } from '@/components/ui/button';
import { Shield, HelpCircle, FileText, Settings } from 'lucide-react';

const MobileNavigation: React.FC = () => {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 safe-area-pb">
      <div className="flex justify-around items-center max-w-md mx-auto">
        <Button
          variant="ghost"
          size="sm"
          className="flex flex-col items-center gap-1 h-auto py-2 px-3"
          onClick={() => window.open('/privacy', '_blank')}
        >
          <Shield className="h-4 w-4" />
          <span className="text-xs">Privacy</span>
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          className="flex flex-col items-center gap-1 h-auto py-2 px-3"
          onClick={() => window.open('/how-it-works', '_blank')}
        >
          <HelpCircle className="h-4 w-4" />
          <span className="text-xs">How it Works</span>
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          className="flex flex-col items-center gap-1 h-auto py-2 px-3"
          onClick={() => window.open('/terms', '_blank')}
        >
          <FileText className="h-4 w-4" />
          <span className="text-xs">Terms</span>
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          className="flex flex-col items-center gap-1 h-auto py-2 px-3"
          onClick={() => window.open('/settings', '_blank')}
        >
          <Settings className="h-4 w-4" />
          <span className="text-xs">Settings</span>
        </Button>
      </div>
    </div>
  );
};

export default MobileNavigation;
