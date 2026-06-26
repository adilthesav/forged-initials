import { useState, useEffect } from 'react';
import { CheckCircle2, Smartphone, Zap, Wifi, Eye } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';

/**
 * MobileOptimizationStatus - Shows current mobile performance optimizations
 * This component is for development/testing purposes only
 */
export function MobileOptimizationStatus() {
  const [connectionType, setConnectionType] = useState<string>('unknown');
  const [isTouch, setIsTouch] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [showStatus, setShowStatus] = useState(false);

  useEffect(() => {
    // Detect connection type
    const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
    if (connection?.effectiveType) {
      setConnectionType(connection.effectiveType);
    }

    // Detect touch device
    setIsTouch('ontouchstart' in window);

    // Detect motion preference
    setPrefersReducedMotion(window.matchMedia('(prefers-reduced-motion: reduce)').matches);

    // Check if we should show status (only in development or with special query param)
    const shouldShow = window.location.search.includes('mobile-status=true');
    setShowStatus(shouldShow);
  }, []);

  if (!showStatus) return null;

  const optimizations = [
    {
      icon: Zap,
      title: 'Lazy Loading',
      description: 'Images load on-demand',
      status: 'active'
    },
    {
      icon: Smartphone,
      title: 'Touch Optimized',
      description: '44px+ tap targets',
      status: isTouch ? 'active' : 'inactive'
    },
    {
      icon: Wifi,
      title: 'Network Aware',
      description: `Connection: ${connectionType}`,
      status: connectionType !== 'unknown' ? 'active' : 'inactive'
    },
    {
      icon: Eye,
      title: 'Reduced Motion',
      description: 'Accessibility mode',
      status: prefersReducedMotion ? 'active' : 'inactive'
    }
  ];

  return (
    <div className="fixed bottom-4 left-4 z-50 max-w-sm">
      <Card className="shadow-xl border-2">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Smartphone className="w-5 h-5 text-primary" />
            <h3 className="font-semibold">Mobile Optimizations</h3>
            <Badge variant="secondary" className="ml-auto text-xs">Active</Badge>
          </div>
          
          <div className="space-y-2">
            {optimizations.map((opt, index) => {
              const Icon = opt.icon;
              return (
                <div key={index} className="flex items-start gap-2 text-sm">
                  <Icon className="w-4 h-4 mt-0.5 text-muted-foreground" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{opt.title}</span>
                      {opt.status === 'active' && (
                        <CheckCircle2 className="w-3 h-3 text-green-500" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">{opt.description}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-3 pt-3 border-t border-border text-xs text-muted-foreground">
            Add <code className="px-1 py-0.5 bg-muted rounded">?mobile-status=true</code> to URL to view
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
