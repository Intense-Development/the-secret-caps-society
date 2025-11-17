#!/bin/bash
#
# Setup script to install git hooks
# This copies the pre-push hook to .git/hooks/
#

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
HOOKS_DIR="$PROJECT_ROOT/.git/hooks"
PRE_PUSH_HOOK="$HOOKS_DIR/pre-push"

echo "🔧 Setting up git hooks..."

# Create hooks directory if it doesn't exist
mkdir -p "$HOOKS_DIR"

# Check if pre-push hook already exists
if [ -f "$PRE_PUSH_HOOK" ]; then
  echo "⚠️  Pre-push hook already exists at $PRE_PUSH_HOOK"
  read -p "Do you want to overwrite it? (y/N) " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Setup cancelled. Existing hook preserved."
    exit 0
  fi
fi

# Create the pre-push hook
cat > "$PRE_PUSH_HOOK" << 'EOF'
#!/bin/sh
#
# Git pre-push hook to verify Supabase configuration before pushing
# This hook runs the Supabase verification script before allowing a push
#

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "${YELLOW}🔍 Running Supabase deployment verification...${NC}\n"

# Run the verification script
npm run verify:supabase

# Capture exit code
VERIFY_EXIT_CODE=$?

if [ $VERIFY_EXIT_CODE -ne 0 ]; then
  echo "\n${RED}❌ Supabase verification failed!${NC}"
  echo "${RED}Push aborted. Please fix the issues above before pushing.${NC}\n"
  echo "${YELLOW}To bypass this check (not recommended), use:${NC}"
  echo "  ${YELLOW}git push --no-verify${NC}\n"
  exit 1
fi

echo "\n${GREEN}✅ Supabase verification passed. Proceeding with push...${NC}\n"
exit 0
EOF

# Make the hook executable
chmod +x "$PRE_PUSH_HOOK"

echo "✅ Git hooks installed successfully!"
echo "   Pre-push hook: $PRE_PUSH_HOOK"
echo ""
echo "The Supabase verification will now run automatically before every git push."
echo "To test it, run: npm run verify:supabase"

