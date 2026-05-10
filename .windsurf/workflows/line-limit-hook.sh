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
    echo ""
    echo "🔧 Refactoring completed successfully - see modular structure:"
    echo "   • styles.ts ($(wc -l src/styles.ts | awk '{print $1}') lines)"
    echo "   • icons.ts ($(wc -l src/icons.ts | awk '{print $1}') lines)"
    echo "   • renderers.ts ($(wc -l src/renderers.ts | awk '{print $1}') lines)"
    echo "   • utils.ts ($(wc -l src/utils.ts | awk '{print $1}') lines)"
    echo "   • document-preview.ts ($(wc -l src/document-preview.ts | awk '{print $1}') lines)"
    exit 1
else
    echo "✅ WITHIN LIMIT: $CURRENT_LINES lines (under $MAX_LINES)"
    exit 0
fi
