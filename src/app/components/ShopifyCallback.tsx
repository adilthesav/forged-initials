import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router';

export function ShopifyCallback() {
  const [params] = useSearchParams();
  const code = params.get('code');
  const shop = params.get('shop');
  const [copied, setCopied] = useState(false);

  const curlCommand = code && shop
    ? `curl -s -X POST https://${shop}/admin/oauth/access_token \\\n  -H "Content-Type: application/json" \\\n  -d '{"client_id":"61cdb72f93901ac37638028a4b29ee00","client_secret":"YOUR_CLIENT_SECRET","code":"${code}"}'`
    : '';

  const copy = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  if (!code || !shop) {
    return (
      <div style={{ fontFamily: 'monospace', padding: '40px', background: '#0f0f0f', minHeight: '100vh', color: '#e0e0e0' }}>
        <h2 style={{ color: '#f87171' }}>No OAuth code found</h2>
        <p>This page is only reached during Shopify app installation. Make sure you started the install from the Partner Dashboard.</p>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: 'monospace', padding: '40px', background: '#0f0f0f', minHeight: '100vh', color: '#e0e0e0', maxWidth: '800px', margin: '0 auto' }}>
      <h2 style={{ color: '#4ade80', marginBottom: '8px' }}>OAuth Code Received</h2>
      <p style={{ color: '#9ca3af', marginBottom: '32px' }}>Run the curl command below in your Mac terminal to exchange this code for your access token.</p>

      <div style={{ marginBottom: '24px' }}>
        <label style={{ color: '#9ca3af', fontSize: '13px', display: 'block', marginBottom: '8px' }}>OAUTH CODE (one-time use, expires in 10 min):</label>
        <div style={{ background: '#1a1a1a', border: '1px solid #333', borderRadius: '6px', padding: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <code style={{ color: '#facc15', wordBreak: 'break-all' }}>{code}</code>
        </div>
      </div>

      <div style={{ marginBottom: '24px' }}>
        <label style={{ color: '#9ca3af', fontSize: '13px', display: 'block', marginBottom: '8px' }}>
          STEP 1 — Replace <code style={{ color: '#f87171' }}>YOUR_CLIENT_SECRET</code> with your actual secret, then run in Terminal:
        </label>
        <div style={{ background: '#1a1a1a', border: '1px solid #333', borderRadius: '6px', padding: '16px', position: 'relative' }}>
          <pre style={{ color: '#a3e635', margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-all', fontSize: '13px' }}>{curlCommand}</pre>
          <button
            onClick={() => copy(curlCommand)}
            style={{ position: 'absolute', top: '12px', right: '12px', background: '#333', border: '1px solid #555', color: '#e0e0e0', padding: '4px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}
          >
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
      </div>

      <div style={{ background: '#1a1a1a', border: '1px solid #333', borderRadius: '8px', padding: '20px' }}>
        <strong style={{ color: '#e0e0e0' }}>STEP 2 — The curl response will look like:</strong>
        <pre style={{ color: '#60a5fa', marginTop: '8px', fontSize: '13px' }}>{`{"access_token":"shpat_xxxxxxxxxxxxxxxxxxxxxxxx","scope":"read_products,read_inventory,write_products"}`}</pre>
        <p style={{ color: '#9ca3af', marginTop: '12px', fontSize: '13px' }}>
          Copy the <code style={{ color: '#facc15' }}>access_token</code> value and add it to Netlify as:<br />
          <code style={{ color: '#4ade80' }}>SHOPIFY_ACCESS_TOKEN = shpat_xxxxxxx...</code>
        </p>
      </div>
    </div>
  );
}
