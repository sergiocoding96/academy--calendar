#!/bin/bash

# Academy Calendar - Worktree Setup Script
# Usage: ./scripts/setup-worktree.sh <feature-name>
# Example: ./scripts/setup-worktree.sh player-database

set -e

FEATURE_NAME=$1
BASE_DIR=$(git rev-parse --show-toplevel)
PARENT_DIR=$(dirname "$BASE_DIR")
WORKTREE_DIR="$PARENT_DIR/academy-calendar--$FEATURE_NAME"
BRANCH_NAME="feature/$FEATURE_NAME"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}🚀 Setting up worktree for: $FEATURE_NAME${NC}"

# Check if feature name provided
if [ -z "$FEATURE_NAME" ]; then
    echo -e "${RED}❌ Error: Please provide a feature name${NC}"
    echo "Usage: ./scripts/setup-worktree.sh <feature-name>"
    echo ""
    echo "Available features:"
    echo "  player-database"
    echo "  schedule-manager"
    echo "  utr-matchplay"
    echo "  tournament-agent"
    echo "  dartfish-analytics"
    echo "  van-manager"
    exit 1
fi

# Check if worktree already exists
if [ -d "$WORKTREE_DIR" ]; then
    echo -e "${YELLOW}⚠️  Worktree already exists at: $WORKTREE_DIR${NC}"
    echo "To remove it: git worktree remove $WORKTREE_DIR"
    exit 1
fi

# Check if branch exists, create if not
if git show-ref --verify --quiet "refs/heads/$BRANCH_NAME"; then
    echo -e "${GREEN}✓ Branch exists: $BRANCH_NAME${NC}"
else
    echo -e "${YELLOW}Creating branch: $BRANCH_NAME${NC}"
    git branch "$BRANCH_NAME"
fi

# Create worktree
echo -e "${YELLOW}Creating worktree at: $WORKTREE_DIR${NC}"
git worktree add "$WORKTREE_DIR" "$BRANCH_NAME"

# Create feature directory structure if it doesn't exist
FEATURE_SRC_DIR="$WORKTREE_DIR/src/features/$FEATURE_NAME"
if [ ! -d "$FEATURE_SRC_DIR" ]; then
    echo -e "${YELLOW}Creating feature directory structure...${NC}"
    mkdir -p "$FEATURE_SRC_DIR/components"
    mkdir -p "$FEATURE_SRC_DIR/hooks"
    mkdir -p "$FEATURE_SRC_DIR/lib"

    # Create feature README
    cat > "$FEATURE_SRC_DIR/README.md" << EOF
# $FEATURE_NAME

## Implementation Notes

> Add implementation-specific notes here as you build

## Component Checklist

- [ ] Component 1
- [ ] Component 2

## API Routes

- [ ] Route 1
- [ ] Route 2

## Testing

- [ ] Unit tests
- [ ] Integration tests
EOF

    # Create types file
    cat > "$FEATURE_SRC_DIR/types.ts" << EOF
// Types for $FEATURE_NAME feature
// See docs/DATABASE_SCHEMA.md for full type definitions

export {};
EOF
fi

echo ""
echo -e "${GREEN}✅ Worktree created successfully!${NC}"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "1. cd $WORKTREE_DIR"
echo "2. npm install (if needed)"
echo "3. Update CLAUDE.md with current feature focus"
echo "4. Start Claude Code: claude"
echo ""
echo -e "${YELLOW}Feature spec:${NC}"
echo "docs/features/*-$FEATURE_NAME.md"
echo ""
echo -e "${YELLOW}When done:${NC}"
echo "git worktree remove $WORKTREE_DIR"
