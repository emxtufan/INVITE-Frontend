#!/usr/bin/env bash
set -euo pipefail

REMOTE="${1:-origin}"
BRANCH="${2:-main}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

cd "$SCRIPT_DIR"

echo "==> Frontend deploy started"
echo "==> Working directory: $SCRIPT_DIR"
echo "==> Remote: $REMOTE | Branch: $BRANCH"

if ! git diff --quiet || ! git diff --cached --quiet; then
  echo "ERROR: Repository has local changes. Commit or stash them before deploy."
  exit 1
fi

echo "==> Fetch latest changes"
git fetch "$REMOTE" "$BRANCH"

echo "==> Pull latest commit"
git pull --ff-only "$REMOTE" "$BRANCH"

if [[ -f package-lock.json ]]; then
  echo "==> Installing dependencies with npm ci"
  npm ci
else
  echo "==> Installing dependencies with npm install"
  npm install
fi

echo "==> Building frontend"
npm run build

if [[ "${RELOAD_APACHE:-0}" == "1" ]]; then
  echo "==> Reloading Apache"
  sudo systemctl reload apache2
fi

echo "==> Deploy finished successfully"
echo "==> Current commit: $(git rev-parse --short HEAD)"
