import { Card } from './ui/card';
import { Copy } from 'lucide-react';

export function HowToCopyText() {
  return (
    <Card className="p-4 bg-blue-50 border-2 border-blue-300">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
          <Copy className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1">
          <h4 className="font-bold text-blue-900 mb-2">📋 How to Copy Text from Black Boxes:</h4>
          
          <div className="space-y-2 text-sm text-blue-900">
            <div className="flex items-start gap-2">
              <span className="font-bold text-blue-600">1.</span>
              <div>
                <strong>Triple-click</strong> (click 3 times fast) on the black box
                <div className="text-xs text-blue-700 mt-1">This selects all the text automatically!</div>
              </div>
            </div>
            
            <div className="flex items-start gap-2">
              <span className="font-bold text-blue-600">2.</span>
              <div>
                Press <code className="bg-gray-900 px-2 py-1 rounded text-green-400 text-xs">Ctrl+C</code> 
                {' '}(Windows) or <code className="bg-gray-900 px-2 py-1 rounded text-green-400 text-xs">Cmd+C</code> (Mac)
                <div className="text-xs text-blue-700 mt-1">This copies the selected text</div>
              </div>
            </div>
            
            <div className="flex items-start gap-2">
              <span className="font-bold text-blue-600">3.</span>
              <div>
                Paste in your terminal with <code className="bg-gray-900 px-2 py-1 rounded text-green-400 text-xs">Ctrl+V</code> 
                {' '}or <code className="bg-gray-900 px-2 py-1 rounded text-green-400 text-xs">Cmd+V</code>
              </div>
            </div>
          </div>

          <div className="mt-3 p-2 bg-white rounded border border-blue-300">
            <div className="text-xs font-semibold text-blue-900 mb-1">💡 Pro Tip:</div>
            <div className="text-xs text-blue-800">
              All black boxes will turn <span className="text-green-600 font-semibold">green</span> when you hover over them - 
              that means they're ready to copy!
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
