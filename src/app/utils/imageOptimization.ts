/**
 * Image Optimization Utilities
 * Provides WebP/AVIF support, responsive images, and format detection
 */

// Check if browser supports WebP
let supportsWebP: boolean | null = null;
let supportsAVIF: boolean | null = null;

export async function checkWebPSupport(): Promise<boolean> {
  if (supportsWebP !== null) return supportsWebP;
  
  return new Promise(resolve => {
    const webP = new Image();
    webP.onload = webP.onerror = () => {
      supportsWebP = webP.height === 2;
      resolve(supportsWebP);
    };
    webP.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
  });
}

export async function checkAVIFSupport(): Promise<boolean> {
  if (supportsAVIF !== null) return supportsAVIF;
  
  return new Promise(resolve => {
    const avif = new Image();
    avif.onload = avif.onerror = () => {
      supportsAVIF = avif.height === 2;
      resolve(supportsAVIF);
    };
    avif.src = 'data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAAB0AAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAIAAAACAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQ0MAAAAABNjb2xybmNseAACAAIAAYAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAACVtZGF0EgAKCBgANogQEAwgMg8f8D///8WfhwB8+ErK42A=';
  });
}

/**
 * Get optimized image URL with format conversion
 */
export async function getOptimizedImageUrl(url: string): Promise<string> {
  // Skip if it's a data URL or already optimized
  if (url.startsWith('data:') || url.startsWith('blob:')) {
    return url;
  }

  // For Unsplash images, add format parameters
  if (url.includes('unsplash.com')) {
    const hasParams = url.includes('?');
    const separator = hasParams ? '&' : '?';
    
    // Check format support
    const avifSupported = await checkAVIFSupport();
    const webpSupported = await checkWebPSupport();
    
    // Add format parameter
    let format = 'auto';
    if (avifSupported) {
      format = 'avif';
    } else if (webpSupported) {
      format = 'webp';
    }
    
    // Add optimization parameters
    return `${url}${separator}fm=${format}&q=80&auto=format`;
  }

  return url;
}

/**
 * Get responsive image URLs for srcset
 */
export function getResponsiveImageUrls(baseUrl: string, widths: number[] = [320, 640, 768, 1024, 1280, 1920]): string {
  if (!baseUrl.includes('unsplash.com')) {
    return '';
  }

  return widths
    .map(width => {
      const url = new URL(baseUrl);
      url.searchParams.set('w', width.toString());
      return `${url.toString()} ${width}w`;
    })
    .join(', ');
}

/**
 * Get optimal image size based on container width
 */
export function getOptimalImageSize(containerWidth: number, devicePixelRatio: number = window.devicePixelRatio || 1): number {
  // Account for device pixel ratio
  const targetWidth = containerWidth * devicePixelRatio;
  
  // Round up to nearest standard size
  const standardSizes = [320, 640, 768, 1024, 1280, 1920, 2560];
  return standardSizes.find(size => size >= targetWidth) || 2560;
}

/**
 * Preload critical images
 */
export function preloadImage(url: string, priority: 'high' | 'low' = 'high'): void {
  const link = document.createElement('link');
  link.rel = 'preload';
  link.as = 'image';
  link.href = url;
  if (priority === 'high') {
    link.setAttribute('fetchpriority', 'high');
  }
  document.head.appendChild(link);
}

/**
 * Lazy load image with Intersection Observer
 */
export function lazyLoadImage(
  imgElement: HTMLImageElement,
  src: string,
  options?: IntersectionObserverInit
): () => void {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          img.src = src;
          img.classList.remove('lazy-loading');
          img.classList.add('lazy-loaded');
          observer.unobserve(img);
        }
      });
    },
    {
      rootMargin: '50px 0px',
      threshold: 0.01,
      ...options
    }
  );

  observer.observe(imgElement);

  // Return cleanup function
  return () => observer.disconnect();
}

/**
 * Image compression quality based on network speed
 */
export function getOptimalQuality(): number {
  const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
  
  if (!connection) return 80;

  const effectiveType = connection.effectiveType;
  
  switch (effectiveType) {
    case '4g':
      return 85; // High quality for fast connections
    case '3g':
      return 75; // Medium quality for moderate connections
    case '2g':
    case 'slow-2g':
      return 60; // Lower quality for slow connections
    default:
      return 80;
  }
}

/**
 * Generate blur placeholder data URL
 */
export function generateBlurPlaceholder(width: number = 10, height: number = 10): string {
  // Simple gray placeholder
  return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 ${width} ${height}'%3E%3Cfilter id='b' color-interpolation-filters='sRGB'%3E%3CfeGaussianBlur stdDeviation='1'/%3E%3C/filter%3E%3Crect width='${width}' height='${height}' fill='%23d4d4d8' filter='url(%23b)'/%3E%3C/svg%3E`;
}

/**
 * Image loading strategy based on viewport position
 */
export function getLoadingStrategy(element: Element): 'eager' | 'lazy' {
  const rect = element.getBoundingClientRect();
  const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
  
  // Load eagerly if in viewport or close to it
  return rect.top < viewportHeight * 1.5 ? 'eager' : 'lazy';
}

/**
 * Calculate aspect ratio from dimensions
 */
export function calculateAspectRatio(width: number, height: number): string {
  const gcd = (a: number, b: number): number => b === 0 ? a : gcd(b, a % b);
  const divisor = gcd(width, height);
  return `${width / divisor}/${height / divisor}`;
}

/**
 * Estimate image file size based on dimensions and quality
 */
export function estimateImageSize(width: number, height: number, quality: number = 80): number {
  // Rough estimation: JPEG is about 0.1-0.3 bytes per pixel at quality 80
  const pixels = width * height;
  const bytesPerPixel = 0.2 * (quality / 80);
  return Math.round(pixels * bytesPerPixel);
}

/**
 * Check if image should be loaded based on data saver mode
 */
export function shouldLoadImage(): boolean {
  const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
  
  // Check data saver mode
  if (connection?.saveData) {
    return false;
  }
  
  return true;
}

/**
 * Get image loading priority based on position and type
 */
export function getImagePriority(
  isHero: boolean,
  isAboveFold: boolean,
  isCritical: boolean
): 'high' | 'low' | 'auto' {
  if (isHero || isCritical) return 'high';
  if (isAboveFold) return 'auto';
  return 'low';
}

/**
 * Batch image preloading with progress tracking
 */
export async function batchPreloadImages(
  urls: string[],
  onProgress?: (loaded: number, total: number) => void
): Promise<void> {
  let loaded = 0;
  const total = urls.length;

  const promises = urls.map(url => {
    return new Promise<void>((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        loaded++;
        onProgress?.(loaded, total);
        resolve();
      };
      img.onerror = reject;
      img.src = url;
    });
  });

  await Promise.allSettled(promises);
}

/**
 * Create responsive image element with all optimizations
 */
export async function createOptimizedImage(
  src: string,
  alt: string,
  options: {
    width?: number;
    height?: number;
    loading?: 'eager' | 'lazy';
    priority?: 'high' | 'low' | 'auto';
    className?: string;
    sizes?: string;
  } = {}
): Promise<HTMLImageElement> {
  const img = document.createElement('img');
  
  // Set source
  const optimizedSrc = await getOptimizedImageUrl(src);
  img.src = optimizedSrc;
  img.alt = alt;
  
  // Set dimensions if provided
  if (options.width) img.width = options.width;
  if (options.height) img.height = options.height;
  
  // Set loading strategy
  img.loading = options.loading || 'lazy';
  
  // Set decoding
  img.decoding = 'async';
  
  // Set priority
  if (options.priority) {
    img.setAttribute('fetchpriority', options.priority);
  }
  
  // Set class
  if (options.className) {
    img.className = options.className;
  }
  
  // Set responsive srcset
  if (src.includes('unsplash.com')) {
    img.srcset = getResponsiveImageUrls(src);
    img.sizes = options.sizes || '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw';
  }
  
  return img;
}
