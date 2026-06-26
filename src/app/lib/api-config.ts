// API Configuration - Central place to manage Edge Function URLs
export const SUPABASE_PROJECT_ID = 'vpxuizymtmcnsgmpnhel';

// Point to functions base URL - routes will include the function name
export const EDGE_FUNCTION_BASE_URL = `https://${SUPABASE_PROJECT_ID}.supabase.co/functions/v1/server`;

export const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZweHVpenltdG1jbnNnbXBuaGVsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA3ODgyMDUsImV4cCI6MjA3NjM2NDIwNX0.zLW_XvdTD6v-xSfCvmvv5GzPkY-si4huEZH65eUOyr4';

// Stripe publishable key (safe to expose in frontend)
export const STRIPE_PUBLISHABLE_KEY = 'pk_live_tcL93G36b40Vqf5oQNd4QWRu00UVi2Nqcg';

// Helper function to call Edge Function endpoints
export async function callEdgeFunction(endpoint: string, options: RequestInit = {}) {
  const url = `${EDGE_FUNCTION_BASE_URL}/${endpoint.replace(/^\//, '')}`;
  
  const response = await fetch(url, {
    ...options,
    headers: {
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  
  return response;
}