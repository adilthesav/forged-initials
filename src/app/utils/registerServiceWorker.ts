/**
 * Service Worker Registration Utility
 * Handles registration, updates, and lifecycle events
 */

export interface ServiceWorkerConfig {
  onSuccess?: (registration: ServiceWorkerRegistration) => void;
  onUpdate?: (registration: ServiceWorkerRegistration) => void;
  onError?: (error: Error) => void;
  enableNotifications?: boolean;
}

/**
 * Register service worker with optional callbacks
 */
export async function registerServiceWorker(config: ServiceWorkerConfig = {}): Promise<ServiceWorkerRegistration | null> {
  // Check if service workers are supported
  if (!('serviceWorker' in navigator)) {
    console.log('Service workers are not supported in this browser');
    return null;
  }

  // Only register in production
  if (process.env.NODE_ENV !== 'production') {
    console.log('Service worker registration skipped in development');
    return null;
  }

  try {
    // Register the service worker
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/'
    });

    console.log('Service worker registered:', registration.scope);

    // Check for updates
    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing;
      
      if (newWorker) {
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            // New service worker available
            console.log('New service worker available');
            config.onUpdate?.(registration);
            
            // Optionally show update notification
            showUpdateNotification(registration);
          } else if (newWorker.state === 'activated') {
            console.log('Service worker activated');
            config.onSuccess?.(registration);
          }
        });
      }
    });

    // Listen for controller change (new SW took over)
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      console.log('Service worker controller changed');
      // Reload the page to use new service worker
      if (confirm('A new version is available. Reload to update?')) {
        window.location.reload();
      }
    });

    // Request notification permission if enabled
    if (config.enableNotifications) {
      await requestNotificationPermission(registration);
    }

    return registration;
  } catch (error) {
    console.error('Service worker registration failed:', error);
    config.onError?.(error as Error);
    return null;
  }
}

/**
 * Unregister service worker
 */
export async function unregisterServiceWorker(): Promise<boolean> {
  if (!('serviceWorker' in navigator)) {
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    const success = await registration.unregister();
    
    if (success) {
      console.log('Service worker unregistered');
    }
    
    return success;
  } catch (error) {
    console.error('Service worker unregistration failed:', error);
    return false;
  }
}

/**
 * Check if service worker is registered
 */
export async function isServiceWorkerRegistered(): Promise<boolean> {
  if (!('serviceWorker' in navigator)) {
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.getRegistration();
    return !!registration;
  } catch {
    return false;
  }
}

/**
 * Update service worker
 */
export async function updateServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!('serviceWorker' in navigator)) {
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    await registration.update();
    console.log('Service worker update check completed');
    return registration;
  } catch (error) {
    console.error('Service worker update failed:', error);
    return null;
  }
}

/**
 * Clear service worker cache
 */
export async function clearServiceWorkerCache(): Promise<void> {
  if (!('serviceWorker' in navigator)) {
    return;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    
    if (registration.active) {
      registration.active.postMessage({ type: 'CLEAR_CACHE' });
      console.log('Service worker cache cleared');
    }
  } catch (error) {
    console.error('Failed to clear service worker cache:', error);
  }
}

/**
 * Show update notification
 */
function showUpdateNotification(registration: ServiceWorkerRegistration): void {
  // Create a simple notification banner
  const banner = document.createElement('div');
  banner.style.cssText = `
    position: fixed;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    background: #1a1a1a;
    color: white;
    padding: 16px 24px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    z-index: 10000;
    display: flex;
    align-items: center;
    gap: 16px;
    font-family: system-ui, -apple-system, sans-serif;
  `;

  banner.innerHTML = `
    <span>A new version is available!</span>
    <button style="
      background: white;
      color: #1a1a1a;
      border: none;
      padding: 8px 16px;
      border-radius: 4px;
      cursor: pointer;
      font-weight: 600;
    ">Update</button>
    <button style="
      background: transparent;
      color: white;
      border: 1px solid white;
      padding: 8px 16px;
      border-radius: 4px;
      cursor: pointer;
    ">Later</button>
  `;

  const updateButton = banner.querySelectorAll('button')[0];
  const laterButton = banner.querySelectorAll('button')[1];

  updateButton.addEventListener('click', () => {
    if (registration.waiting) {
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    }
    window.location.reload();
  });

  laterButton.addEventListener('click', () => {
    banner.remove();
  });

  document.body.appendChild(banner);

  // Auto-remove after 30 seconds
  setTimeout(() => {
    banner.remove();
  }, 30000);
}

/**
 * Request notification permission
 */
async function requestNotificationPermission(registration: ServiceWorkerRegistration): Promise<NotificationPermission> {
  if (!('Notification' in window)) {
    console.log('Notifications not supported');
    return 'denied';
  }

  if (Notification.permission === 'granted') {
    return 'granted';
  }

  if (Notification.permission === 'denied') {
    return 'denied';
  }

  // Request permission
  const permission = await Notification.requestPermission();
  
  if (permission === 'granted') {
    console.log('Notification permission granted');
    
    // Subscribe to push notifications (optional)
    await subscribeToPushNotifications(registration);
  }

  return permission;
}

/**
 * Subscribe to push notifications
 */
async function subscribeToPushNotifications(registration: ServiceWorkerRegistration): Promise<PushSubscription | null> {
  try {
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(
        // Replace with your VAPID public key
        'YOUR_VAPID_PUBLIC_KEY'
      )
    });

    console.log('Push notification subscription:', subscription);
    
    // Send subscription to your server
    // await sendSubscriptionToServer(subscription);

    return subscription;
  } catch (error) {
    console.error('Failed to subscribe to push notifications:', error);
    return null;
  }
}

/**
 * Convert VAPID key
 */
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  
  return outputArray;
}

/**
 * Check if offline
 */
export function isOffline(): boolean {
  return !navigator.onLine;
}

/**
 * Listen for online/offline events
 */
export function watchNetworkStatus(
  onOnline: () => void,
  onOffline: () => void
): () => void {
  window.addEventListener('online', onOnline);
  window.addEventListener('offline', onOffline);

  // Return cleanup function
  return () => {
    window.removeEventListener('online', onOnline);
    window.removeEventListener('offline', onOffline);
  };
}

/**
 * Get service worker status
 */
export async function getServiceWorkerStatus(): Promise<{
  supported: boolean;
  registered: boolean;
  active: boolean;
  controller: boolean;
}> {
  const supported = 'serviceWorker' in navigator;

  if (!supported) {
    return {
      supported: false,
      registered: false,
      active: false,
      controller: false
    };
  }

  try {
    const registration = await navigator.serviceWorker.getRegistration();
    
    return {
      supported: true,
      registered: !!registration,
      active: !!registration?.active,
      controller: !!navigator.serviceWorker.controller
    };
  } catch {
    return {
      supported: true,
      registered: false,
      active: false,
      controller: false
    };
  }
}
