import { useState } from 'react';

// Configuration
const SUPABASE_EDGE_BASE = "https://vpxuizymtmcnsgmpnhel.supabase.co/functions/v1/server";
const ANON_KEY =
  (typeof process !== "undefined" && process.env?.NEXT_PUBLIC_SUPABASE_ANON_KEY) ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZweHVpenltdG1jbnNnbXBuaGVsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA3ODgyMDUsImV4cCI6MjA3NjM2NDIwNX0.zLW_XvdTD6v-xSfCvmvv5GzPkY-si4huEZH65eUOyr4";

// API helper - creates checkout session and returns Stripe URL
export async function createCheckoutSession({
  items,
  currency = "usd",
}: {
  items: { name: string; unitAmount: number; quantity: number }[];
  currency?: string;
}) {
  if (!ANON_KEY) throw new Error("Missing public Supabase ANON key");

  const res = await fetch(`${SUPABASE_EDGE_BASE}/create-checkout-session`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${ANON_KEY}`,
    },
    body: JSON.stringify({
      items, // [{ name, unitAmount (in cents), quantity }]
      currency,
      successUrl: `${window.location.origin}/success`,
      cancelUrl: `${window.location.origin}/cancel`,
    }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || `Checkout failed (${res.status})`);
  }
  if (!data.url) throw new Error("Server did not return a Stripe URL");
  return data.url;
}

// Testing helper
export async function pingServer() {
  const r = await fetch(`${SUPABASE_EDGE_BASE}/health`, {
    headers: {
      Authorization: `Bearer ${ANON_KEY}`,
    },
  });
  const text = await r.text();
  console.log("Health:", r.status, text);
  return { status: r.status, body: text };
}

// Hook for checkout flow
export function useCheckout() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkout = async (params: {
    lettersTotalUSD: number;
    hardwareTotalUSD: number;
    shippingUSD: number;
  }) => {
    setIsLoading(true);
    setError(null);

    try {
      // Build items from calculator (amounts in cents)
      const items: { name: string; unitAmount: number; quantity: number }[] = [];

      if (params.lettersTotalUSD > 0) {
        items.push({
          name: "Letters",
          unitAmount: Math.round(params.lettersTotalUSD * 100),
          quantity: 1,
        });
      }

      if (params.hardwareTotalUSD > 0) {
        items.push({
          name: "Hardware (bails)",
          unitAmount: Math.round(params.hardwareTotalUSD * 100),
          quantity: 1,
        });
      }

      if (params.shippingUSD > 0) {
        items.push({
          name: "Shipping (Houston, TX)",
          unitAmount: Math.round(params.shippingUSD * 100),
          quantity: 1,
        });
      }

      if (items.length === 0) {
        throw new Error("No items to checkout");
      }

      const url = await createCheckoutSession({ items, currency: "usd" });

      // Redirect to Stripe Checkout
      window.location.href = url;
    } catch (err: any) {
      console.error("Checkout error:", err);
      setError(err.message || "Payment initialization failed");
      setIsLoading(false);
    }
  };

  return { checkout, isLoading, error };
}

// Simple button component
interface CheckoutButtonProps {
  lettersTotalUSD: number;
  hardwareTotalUSD: number;
  shippingUSD: number;
  disabled?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export function CheckoutButton({
  lettersTotalUSD,
  hardwareTotalUSD,
  shippingUSD,
  disabled = false,
  className = "",
  children = "Checkout with Stripe",
}: CheckoutButtonProps) {
  const { checkout, isLoading, error } = useCheckout();

  const handleClick = async () => {
    await checkout({ lettersTotalUSD, hardwareTotalUSD, shippingUSD });
  };

  return (
    <div>
      <button
        onClick={handleClick}
        disabled={disabled || isLoading}
        className={className || "px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"}
      >
        {isLoading ? "Redirecting to Stripe..." : children}
      </button>
      {error && (
        <div className="mt-2 text-sm text-red-600">
          {error}
        </div>
      )}
    </div>
  );
}
