#!/usr/bin/env bash
# HealthHelp KB — one-command quickstart
# Usage: bash setup.sh
set -euo pipefail

echo "🏥 HealthHelp Knowledge Base — Setup"
echo "======================================"
echo ""

# Check for bun
if ! command -v bun &>/dev/null; then
  echo "❌ bun is required. Install from https://bun.sh"
  exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
bun install

# Check for .env.local
if [ ! -f .env.local ]; then
  echo ""
  echo "⚙️  Creating .env.local from template..."
  cat > .env.local <<'ENVEOF'
# Sanity CMS — https://sanity.io/manage
NEXT_PUBLIC_SANITY_PROJECT_ID=your_project_id
NEXT_PUBLIC_SANITY_DATASET=production
SANITY_WRITE_TOKEN=your_write_token
SANITY_WEBHOOK_SECRET=your_webhook_secret

# Algolia Search — https://www.algolia.com/account/api-keys
NEXT_PUBLIC_ALGOLIA_APP_ID=your_app_id
NEXT_PUBLIC_ALGOLIA_SEARCH_KEY=your_search_only_api_key
ALGOLIA_ADMIN_KEY=your_admin_api_key
ALGOLIA_INDEX_NAME=healthhelp_articles

# Analytics (optional)
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
ENVEOF
  echo "   Created .env.local — fill in your credentials before continuing."
  echo ""
fi

echo "📋 Next steps:"
echo ""
echo "  1. Fill in .env.local with your Sanity + Algolia credentials"
echo ""
echo "  2. Seed the Sanity CMS with sample content:"
echo "     NEXT_PUBLIC_SANITY_PROJECT_ID=xxx SANITY_WRITE_TOKEN=xxx bun scripts/seed.ts"
echo ""
echo "  3. Index articles to Algolia:"
echo "     NEXT_PUBLIC_SANITY_PROJECT_ID=xxx ALGOLIA_APP_ID=xxx ALGOLIA_ADMIN_KEY=xxx bun scripts/algolia-index.ts"
echo ""
echo "  4. Start the dev server:"
echo "     bun dev"
echo ""
echo "  5. Open Sanity Studio at http://localhost:3000/studio"
echo ""
echo "✅ Setup complete!"
