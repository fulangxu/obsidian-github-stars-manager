#!/bin/bash

# Deploy Obsidian GitHub Stars Manager Plugin (WSL)
# Usage: Copy this file to deploy-wsl.sh and set TARGET_DIR below.

echo "Deploy Obsidian GitHub Stars Manager Plugin (WSL)"
echo "=========================================="
echo

# Set your Obsidian plugin directory here, e.g.:
# TARGET_DIR="/mnt/c/Users/YourName/YourVault/.obsidian/plugins/github-stars-manager"
TARGET_DIR="${OBSIDIAN_PLUGIN_DIR:-}"

if [ -z "$TARGET_DIR" ]; then
    echo "Error: OBSIDIAN_PLUGIN_DIR is not set."
    echo "Either export it or edit this script to set TARGET_DIR directly."
    echo ""
    echo "  export OBSIDIAN_PLUGIN_DIR=\"/mnt/c/Users/YourName/YourVault/.obsidian/plugins/github-stars-manager\""
    exit 1
fi

TARGET_DIR="$TARGET_DIR/github-stars-manager"

echo "Target: $TARGET_DIR"
echo

if [ ! -d "$TARGET_DIR" ]; then
    echo "Creating target directory..."
    mkdir -p "$TARGET_DIR"
fi

echo "Deploying..."
echo

if [ -f "main.js" ]; then
    cp "main.js" "$TARGET_DIR/main.js"
    echo "Done: main.js"
else
    echo "Warning: main.js not found, run npm run build first"
fi

if [ -f "styles.css" ]; then
    cp "styles.css" "$TARGET_DIR/styles.css"
    echo "Done: styles.css"
fi

if [ -f "manifest.json" ]; then
    cp "manifest.json" "$TARGET_DIR/manifest.json"
    echo "Done: manifest.json"
fi

echo
echo "Deploy complete: $TARGET_DIR"
echo "Reload the plugin in Obsidian to see changes."
