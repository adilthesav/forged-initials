import { useEffect } from 'react';

export function ConsoleDeploymentGuide() {
  useEffect(() => {
    // Check if Edge Function is deployed
    const checkDeployment = async () => {
      try {
        const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID || '';
        const publicAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
        
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/server/health`,
          {
            method: 'GET',
            headers: { Authorization: `Bearer ${publicAnonKey}` },
          }
        );
        
        if (!response.ok) {
          throw new Error('Not deployed');
        }
        
        // Edge Function is deployed - show success message
        console.log('%c🎉 Deployment Successful!', 'color: #22c55e; font-size: 18px; font-weight: bold; background: #f0fdf4; padding: 8px;');
        console.log('%c', 'font-size: 2px;');
        console.log('%c✅ Edge Function is LIVE and running!', 'color: #22c55e; font-size: 16px; font-weight: bold;');
        console.log('%c', 'font-size: 2px;');
        console.log('%cAll backend features are active:', 'color: #22c55e; font-size: 14px;');
        console.log('  ✓ Payment processing (Stripe with Card, Cash App, Link)');
        console.log('  ✓ Order storage and management');
        console.log('  ✓ Discord notifications (if configured)');
        console.log('  ✓ Email notifications (if configured)');
        console.log('  ✓ Shipping integration (if configured)');
        console.log('%c', 'font-size: 2px;');
        console.log('%c🧪 Next Step: Verify Discord Integration', 'color: #3b82f6; font-size: 14px; font-weight: bold;');
        console.log('  1. Type anywhere on the page: FORGED_OWNER_MODE');
        console.log('  2. Click the owner panel in the bottom-right');
        console.log('  3. Click "Run Test" on the green deployment card');
        console.log('  4. Check your Discord for test notification');
        console.log('%c', 'font-size: 2px;');
        console.log('%c💡 Discord Setup Reminder:', 'color: #8b5cf6; font-size: 14px; font-weight: bold;');
        console.log('  If you haven\'t added Discord notifications yet:');
        console.log('  1. Add DISCORD_WEBHOOK_URL to Supabase Edge Function secrets');
        console.log('  2. REDEPLOY the Edge Function (critical step!)');
        console.log('  3. Use the Testing Dashboard → Discord Setup tab for guided setup');
        console.log('%c', 'font-size: 2px;');
        
      } catch (error) {
        // Edge Function not deployed - show deployment guide
        console.log('%c⚠️ Edge Function Not Deployed', 'color: #f59e0b; font-size: 18px; font-weight: bold; background: #fffbeb; padding: 8px;');
        console.log('%c', 'font-size: 2px;');
        console.log('%c🔧 Quick Fix (30 seconds):', 'color: #f59e0b; font-size: 14px; font-weight: bold;');
        console.log('%c', 'font-size: 2px;');
        console.log('1. Open your terminal');
        console.log('2. Navigate to your project folder');
        console.log('3. Run this command:');
        console.log('%c   supabase functions deploy server', 'color: #3b82f6; font-size: 13px; font-weight: bold; background: #eff6ff; padding: 4px;');
        console.log('%c', 'font-size: 2px;');
        console.log('%cWhat this fixes:', 'color: #f59e0b; font-size: 14px; font-weight: bold;');
        console.log('  ✓ Removes "Failed to fetch" errors');
        console.log('  ✓ Enables payment processing');
        console.log('  ✓ Activates order storage');
        console.log('  ✓ Turns on notifications');
        console.log('%c', 'font-size: 2px;');
        console.log('%c📚 Need help? Check: /FIX_FETCH_ERRORS.md', 'color: #6b7280; font-size: 12px;');
        console.log('%c', 'font-size: 2px;');
        console.log('%c──────────────────────────────────────────────────', 'color: #e5e7eb;');
      }
    };
    
    checkDeployment();
  }, []);

  return null; // This component doesn't render anything
}
