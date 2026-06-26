import { Card } from './ui/card';
import { MousePointer2 } from 'lucide-react';

export function CopyInstructions() {
  return (
    <Card className="p-3 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-300">
      <div className="flex items-center gap-3">
        <MousePointer2 className="w-8 h-8 text-blue-600 flex-shrink-0" />
        <div className="flex-1">
          <div className="font-bold text-blue-900 text-sm mb-1">
            💡 Quick Tip: How to Copy Commands
          </div>
          <div className="text-xs text-blue-800">
            <strong>Triple-click</strong> any black box → Press <kbd className="px-1.5 py-0.5 bg-gray-900 text-green-400 rounded text-xs">Ctrl+C</kbd> → Paste with <kbd className="px-1.5 py-0.5 bg-gray-900 text-green-400 rounded text-xs">Ctrl+V</kbd>
          </div>
        </div>
      </div>
    </Card>
  );
}
