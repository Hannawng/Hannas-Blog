#!/bin/bash

# Auto-Sync Skript für Hannas-Blog
# Dieses Skript committet und pusht automatisch Änderungen zu GitHub

REPO_DIR="/Users/hannawang/Documents/GitHub/Hannas-Blog"
cd "$REPO_DIR" || exit 1

# Prüfe auf Änderungen
if [[ -z $(git status -s) ]]; then
    exit 0
fi

# Alle Änderungen stagen
git add -A

# Commit mit Timestamp
COMMIT_MSG="Auto-Sync: $(date '+%Y-%m-%d %H:%M:%S')"
git commit -m "$COMMIT_MSG"

# Zu GitHub pushen
git push origin main

echo "✓ Synced at $(date '+%Y-%m-%d %H:%M:%S')"
