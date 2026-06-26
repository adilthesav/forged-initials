#!/bin/bash
# Quick script to add /server/ to all function URLs

echo "Fixing all Edge Function URLs to include /server/ prefix..."

# Fix TestNotification.tsx
sed -i '' 's|functions/v1/debug-env|functions/v1/server/debug-env|g' /components/TestNotification.tsx
sed -i '' 's|functions/v1/discord-notify|functions/v1/server/discord-notify|g' /components/TestNotification.tsx

# Fix TestSystem.tsx  
sed -i '' 's|functions/v1/debug-env|functions/v1/server/debug-env|g' /components/TestSystem.tsx
sed -i '' 's|functions/v1/test-notification|functions/v1/server/test-notification|g' /components/TestSystem.tsx
sed -i '' 's|functions/v1/notify-cashapp-payment|functions/v1/server/notify-cashapp-payment|g' /components/TestSystem.tsx
sed -i '' 's|functions/v1/create-shipment|functions/v1/server/create-shipment|g' /components/TestSystem.tsx
sed -i '' 's|functions/v1/verify-fedex-credentials|functions/v1/server/verify-fedex-credentials|g' /components/TestSystem.tsx
sed -i '' 's|functions/v1/send-tracking-email|functions/v1/server/send-tracking-email|g' /components/TestSystem.tsx
sed -i '' 's|functions/v1/send-receipt-email|functions/v1/server/send-receipt-email|g' /components/TestSystem.tsx

# Fix DiagnosticPanel.tsx
sed -i '' 's|functions/v1/test-notification|functions/v1/server/test-notification|g' /components/DiagnosticPanel.tsx

# Fix StripeSetupCheck.tsx
sed -i '' 's|functions/v1/health|functions/v1/server/health|g' /components/StripeSetupCheck.tsx
sed -i '' 's|functions/v1/debug-env|functions/v1/server/debug-env|g' /components/StripeSetupCheck.tsx
sed -i '' 's|functions/v1/test-payment-flow|functions/v1/server/test-payment-flow|g' /components/StripeSetupCheck.tsx

# Fix DeploymentBanner.tsx
sed -i '' 's|functions/v1/health|functions/v1/server/health|g' /components/DeploymentBanner.tsx

echo "Done! All URLs now point to /functions/v1/server/*"
