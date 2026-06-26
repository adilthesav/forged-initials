#!/bin/bash
# This script updates your local index.ts with the Discord-enabled version

echo "🔄 Updating local index.ts file with Discord endpoints..."

cd /Users/adilali/Documents/webcontents/web\ files/forged-initials-site/supabase/functions/server

# Backup old file
if [ -f "index.ts" ]; then
  echo "📦 Backing up old file to index.ts.before-discord-fix"
  cp index.ts index.ts.before-discord-fix
fi

# The easiest way: Copy from the web app's index.tsx to index.ts
if [ -f "index.tsx" ]; then
  echo "✅ Found index.tsx - copying to index.ts"
  cp index.tsx index.ts
  echo "✅ File updated successfully!"
else
  echo "❌ index.tsx not found locally"
  echo ""
  echo "MANUAL FIX NEEDED:"
  echo "1. Go to: https://supabase.com/dashboard/project/vpxuizymtmcnsgmpnhel/functions/server"
  echo "2. Copy ALL the code from the editor"
  echo "3. Run: nano index.ts"
  echo "4. Delete all content (Ctrl+K repeatedly)"
  echo "5. Paste the copied code"
  echo "6. Save (Ctrl+O, Enter, Ctrl+X)"
  exit 1
fi

echo ""
echo "📤 Now redeploy with:"
echo "cd /Users/adilali/Documents/webcontents/web\ files/forged-initials-site/supabase/functions"
echo "supabase functions deploy server"
