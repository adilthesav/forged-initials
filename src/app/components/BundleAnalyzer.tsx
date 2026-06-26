import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Package, FileCode, Image as ImageIcon, Zap } from 'lucide-react';

/**
 * Bundle Analyzer - Shows bundle size and performance metrics
 * Only visible with ?bundle-stats=true
 */
export function BundleAnalyzer() {
  const [show, setShow] = useState(false);
  const [stats, setStats] = useState({
    totalSize: 0,
    jsSize: 0,
    cssSize: 0,
    imageSize: 0,
    resourceCount: 0,
    cachedResources: 0
  });

  useEffect(() => {
    // Only show if query param is present
    const shouldShow = window.location.search.includes('bundle-stats=true');
    setShow(shouldShow);

    if (shouldShow) {
      collectBundleStats();
    }
  }, []);

  const collectBundleStats = () => {
    if (!performance || !performance.getEntriesByType) {
      return;
    }

    const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
    
    let jsSize = 0;
    let cssSize = 0;
    let imageSize = 0;
    let totalSize = 0;
    let cachedCount = 0;

    resources.forEach((resource) => {
      const size = resource.transferSize || resource.decodedBodySize || 0;
      totalSize += size;

      // Check if cached
      if (resource.transferSize === 0 && resource.decodedBodySize > 0) {
        cachedCount++;
      }

      // Categorize by type
      const name = resource.name.toLowerCase();
      if (name.endsWith('.js') || resource.initiatorType === 'script') {
        jsSize += size;
      } else if (name.endsWith('.css') || resource.initiatorType === 'css') {
        cssSize += size;
      } else if (
        name.match(/\.(jpg|jpeg|png|gif|webp|avif|svg)/) ||
        resource.initiatorType === 'img'
      ) {
        imageSize += size;
      }
    });

    setStats({
      totalSize,
      jsSize,
      cssSize,
      imageSize,
      resourceCount: resources.length,
      cachedResources: cachedCount
    });
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
  };

  const getPerformanceRating = (size: number): 'good' | 'warning' | 'poor' => {
    if (size < 500 * 1024) return 'good'; // < 500KB
    if (size < 1024 * 1024) return 'warning'; // < 1MB
    return 'poor';
  };

  if (!show) return null;

  const totalRating = getPerformanceRating(stats.totalSize);

  return (
    <div className="fixed bottom-4 right-4 z-50 w-96 max-w-[calc(100vw-2rem)]">
      <Card className="shadow-xl border-2">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Package className="w-5 h-5" />
              Bundle Statistics
            </CardTitle>
            <Badge 
              variant={totalRating === 'good' ? 'default' : totalRating === 'warning' ? 'secondary' : 'destructive'}
            >
              {totalRating === 'good' ? '✅ Optimized' : totalRating === 'warning' ? '⚠️ Fair' : '❌ Large'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Total Size */}
          <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-primary" />
              <span className="font-medium">Total Size</span>
            </div>
            <span className="text-lg font-bold">{formatBytes(stats.totalSize)}</span>
          </div>

          {/* Resource Breakdown */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <FileCode className="w-4 h-4 text-blue-500" />
                <span>JavaScript</span>
              </div>
              <span className="font-medium">{formatBytes(stats.jsSize)}</span>
            </div>

            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <FileCode className="w-4 h-4 text-purple-500" />
                <span>CSS</span>
              </div>
              <span className="font-medium">{formatBytes(stats.cssSize)}</span>
            </div>

            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-green-500" />
                <span>Images</span>
              </div>
              <span className="font-medium">{formatBytes(stats.imageSize)}</span>
            </div>
          </div>

          {/* Resource Count */}
          <div className="pt-2 border-t border-border">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Total Resources</span>
              <span className="font-medium">{stats.resourceCount}</span>
            </div>
            <div className="flex items-center justify-between text-sm mt-1">
              <span className="text-muted-foreground">Cached Resources</span>
              <span className="font-medium text-green-600">
                {stats.cachedResources} ({Math.round((stats.cachedResources / stats.resourceCount) * 100)}%)
              </span>
            </div>
          </div>

          {/* Performance Tips */}
          {totalRating !== 'good' && (
            <div className="pt-2 border-t border-border">
              <p className="text-xs text-muted-foreground">
                💡 <strong>Tips:</strong> Consider code splitting, image optimization, or lazy loading to reduce bundle size.
              </p>
            </div>
          )}

          {/* Instructions */}
          <div className="pt-2 border-t border-border text-xs text-muted-foreground">
            Add <code className="px-1 py-0.5 bg-muted rounded">?bundle-stats=true</code> to URL to view
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Performance Budget Checker
 * Warns if bundle size exceeds recommended limits
 */
export function checkPerformanceBudget(): {
  passed: boolean;
  warnings: string[];
} {
  if (!performance || !performance.getEntriesByType) {
    return { passed: true, warnings: [] };
  }

  const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
  const warnings: string[] = [];

  let jsSize = 0;
  let cssSize = 0;
  let totalSize = 0;

  resources.forEach((resource) => {
    const size = resource.transferSize || resource.decodedBodySize || 0;
    totalSize += size;

    const name = resource.name.toLowerCase();
    if (name.endsWith('.js') || resource.initiatorType === 'script') {
      jsSize += size;
    } else if (name.endsWith('.css') || resource.initiatorType === 'css') {
      cssSize += size;
    }
  });

  // Performance budgets
  const BUDGET_JS = 300 * 1024; // 300KB
  const BUDGET_CSS = 100 * 1024; // 100KB
  const BUDGET_TOTAL = 1024 * 1024; // 1MB

  if (jsSize > BUDGET_JS) {
    warnings.push(`JavaScript bundle (${(jsSize / 1024).toFixed(0)}KB) exceeds budget of ${BUDGET_JS / 1024}KB`);
  }

  if (cssSize > BUDGET_CSS) {
    warnings.push(`CSS bundle (${(cssSize / 1024).toFixed(0)}KB) exceeds budget of ${BUDGET_CSS / 1024}KB`);
  }

  if (totalSize > BUDGET_TOTAL) {
    warnings.push(`Total bundle (${(totalSize / 1024).toFixed(0)}KB) exceeds budget of ${BUDGET_TOTAL / 1024}KB`);
  }

  return {
    passed: warnings.length === 0,
    warnings
  };
}
