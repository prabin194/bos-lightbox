---
description: Enforce 255-line limit for document-preview component
---

# Line Limit Hook Enforcement

This workflow enforces a 255-line limit on the document-preview component to maintain code quality and prevent files from becoming too large and difficult to manage.

## When to Run

Automatically runs when:
- Files in `src/document-preview.ts` exceed 255 lines
- During pre-commit checks
- On manual trigger via `/line-limit-check`

## What It Does

1. **Counts Lines**: Analyzes `src/document-preview.ts` and counts total lines
2. **Enforces Limit**: Blocks actions if file exceeds 255 lines
3. **Provides Feedback**: Shows current line count and suggestions
4. **Suggests Refactoring**: Recommends breaking down large files

## Implementation

```bash
#!/bin/bash

# Line count and limit enforcement
MAX_LINES=255
FILE_PATH="src/document-preview.ts"

# Count current lines
CURRENT_LINES=$(wc -l < "$FILE_PATH" | awk '{print $1}')

echo "📊 Current line count: $CURRENT_LINES"
echo "📏 Maximum allowed: $MAX_LINES"

if [ "$CURRENT_LINES" -gt "$MAX_LINES" ]; then
    echo "❌ EXCEEDED: File has $CURRENT_LINES lines (limit: $MAX_LINES)"
    echo "💡 Suggestions:"
    echo "   • Break down into smaller modules"
    echo "   • Extract styles to separate file"
    echo "   • Create utility functions"
    echo "   • Consider component composition"
    exit 1
else
    echo "✅ WITHIN LIMIT: $CURRENT_LINES lines (under $MAX_LINES)"
    exit 0
fi
```

## Usage Examples

```bash
# Check current status
./.windsurf/workflows/line-limit-hook.sh

# Manual trigger
/line-limit-check
```

## Refactoring Guidelines

When approaching the limit, consider:

1. **Extract Styles**: Move CSS to `styles.ts`
2. **Create Renderers**: Separate rendering logic into `renderers.ts`
3. **Utility Functions**: Move helpers to `utils.ts`
4. **Component Split**: Break into logical sub-components
5. **Constants**: Extract constants and configuration

## Benefits

- ✅ **Maintainability**: Easier to understand and modify
- ✅ **Testability**: Smaller files are easier to test
- ✅ **Collaboration**: Team members can work on different parts
- ✅ **Performance**: Better tree-shaking and code splitting
- ✅ **Code Review**: Smaller PRs are easier to review
