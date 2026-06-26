import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Terminal, CheckCircle2, Copy, ExternalLink } from 'lucide-react';
import { Button } from './ui/button';
import { useState } from 'react';

export function DeploymentQuickGuide() {
  const [copiedCommand, setCopiedCommand] = useState<number | null>(null);

  const commands = [
    { 
      id: 1, 
      label: '1. Login to Supabase', 
      command: 'supabase login',
      description: 'Opens browser for authorization'
    },
    { 
      id: 2, 
      label: '2. Link Your Project', 
      command: 'supabase link --project-ref vpxuizymtmcnsgmpnhel',
      description: 'Connects to your Forged Initials project'
    },
    { 
      id: 3, 
      label: '3. Deploy Edge Function', 
      command: 'supabase functions deploy server',
      description: 'Deploys payment processing backend'
    },
    { 
      id: 4, 
      label: '4. Add Stripe Secret', 
      command: 'supabase secrets set STRIPE_SECRET_KEY=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',
      description: 'Configures Stripe payment processing'
    },
  ];

  const copyCommand = (command: string, id: number) => {
    navigator.clipboard.writeText(command);
    setCopiedCommand(id);
    setTimeout(() => setCopiedCommand(null), 2000);
  };

  const testCommand = `fetch('https://vpxuizymtmcnsgmpnhel.supabase.co/functions/v1/server/health', {
  headers: { 'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZweHVpenltdG1jbnNnbXBuaGVsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA3ODgyMDUsImV4cCI6MjA3NjM2NDIwNX0.zLW_XvdTD6v-xSfCvmvv5GzPkY-si4huEZH65eUOyr4' }
})
.then(r => r.json())
.then(d => console.log('✅ DEPLOYED:', d))
.catch(e => console.error('❌ NOT DEPLOYED:', e));`;

  const [copiedTest, setCopiedTest] = useState(false);

  const copyTestCommand = () => {
    navigator.clipboard.writeText(testCommand);
    setCopiedTest(true);
    setTimeout(() => setCopiedTest(false), 2000);
  };

  return (
    <Card className="border-red-300 bg-red-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-red-900">
          <Terminal className="w-5 h-5" />
          🚀 Edge Function Not Deployed
        </CardTitle>
        <p className="text-sm text-red-800">
          Your payment backend needs to be deployed. Run these commands in your terminal:
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Prerequisites */}
        <div className="p-3 bg-yellow-50 border border-yellow-300 rounded">
          <p className="text-sm font-semibold text-yellow-900 mb-2">⚠️ Prerequisites:</p>
          <div className="text-xs text-yellow-800 space-y-1">
            <p>• Install Supabase CLI first (if not installed):</p>
            <div className="ml-4 space-y-1 font-mono">
              <p>Mac: <code className="bg-yellow-100 px-1 rounded">brew install supabase/tap/supabase</code></p>
              <p>Windows: <code className="bg-yellow-100 px-1 rounded">scoop install supabase</code></p>
              <p>npm: <code className="bg-yellow-100 px-1 rounded">npm install -g supabase</code></p>
            </div>
          </div>
        </div>

        {/* Commands */}
        <div className="space-y-3">
          {commands.map((cmd) => (
            <div key={cmd.id} className="space-y-1">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-red-900">{cmd.label}</p>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => copyCommand(cmd.command, cmd.id)}
                  className="h-7 text-xs"
                >
                  {copiedCommand === cmd.id ? (
                    <>
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3 mr-1" />
                      Copy
                    </>
                  )}
                </Button>
              </div>
              <div className="bg-slate-900 text-green-400 p-2 rounded font-mono text-xs overflow-x-auto">
                {cmd.command}
              </div>
              <p className="text-xs text-muted-foreground ml-1">{cmd.description}</p>
            </div>
          ))}
        </div>

        {/* Verification */}
        <div className="p-3 bg-blue-50 border border-blue-300 rounded space-y-2">
          <p className="text-sm font-semibold text-blue-900">✅ Verify Deployment:</p>
          <p className="text-xs text-blue-800">
            After deploying, test in browser console (F12):
          </p>
          <div className="relative">
            <pre className="bg-slate-900 text-green-400 p-3 rounded text-xs overflow-x-auto max-h-32">
              {testCommand}
            </pre>
            <Button
              size="sm"
              variant="outline"
              onClick={copyTestCommand}
              className="absolute top-2 right-2 h-7 text-xs bg-white/90"
            >
              {copiedTest ? (
                <>
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3 mr-1" />
                  Copy
                </>
              )}
            </Button>
          </div>
          <p className="text-xs text-blue-700">
            Expected: <code className="bg-blue-100 px-1 rounded">✅ DEPLOYED: {'{'}status: "ok"{'}'}</code>
          </p>
        </div>

        {/* Documentation Links */}
        <div className="flex gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 text-xs"
            onClick={() => window.open('https://supabase.com/docs/guides/functions/deploy', '_blank')}
          >
            <ExternalLink className="w-3 h-3 mr-1" />
            Supabase Docs
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1 text-xs"
            onClick={() => {
              // Scroll to show file references
              alert('See DEPLOY_EDGE_FUNCTION_NOW.md and FAILED_TO_FETCH_FIX.md for detailed guides');
            }}
          >
            📖 View Guides
          </Button>
        </div>

        {/* Timeline */}
        <div className="p-3 bg-green-50 border border-green-300 rounded">
          <p className="text-sm font-semibold text-green-900 mb-2">⏱️ Timeline:</p>
          <ul className="text-xs text-green-800 space-y-1">
            <li>• Commands 1-3: <strong>2 minutes</strong></li>
            <li>• Command 4: <strong>30 seconds</strong></li>
            <li>• Wait for function to load: <strong>30 seconds</strong></li>
            <li>• <strong>Total: ~3 minutes to fix!</strong></li>
          </ul>
        </div>

        {/* What Happens Next */}
        <div className="p-3 bg-purple-50 border border-purple-300 rounded">
          <p className="text-sm font-semibold text-purple-900 mb-2">🎯 After Deployment:</p>
          <ul className="text-xs text-purple-800 space-y-1">
            <li>✅ All "Failed to fetch" errors will be resolved</li>
            <li>✅ Payment diagnostics will pass</li>
            <li>✅ Stripe payment form will load</li>
            <li>✅ You can accept customer payments!</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
