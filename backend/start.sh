#!/bin/bash
cd "$(dirname "$0")"

echo "Clearing macOS quarantine flags..."
find venv -name "*.so" -print0 | xargs -0 xattr -d com.apple.quarantine 2>/dev/null || true
find venv -name "*.dylib" -print0 | xargs -0 xattr -d com.apple.quarantine 2>/dev/null || true
xattr -rd com.apple.quarantine venv 2>/dev/null || true

source venv/bin/activate

# Local development only: export secrets from .env if present.
# In Docker, pass GEMINI_API_KEY via `docker run -e GEMINI_API_KEY=...` instead.
if [ -f .env ]; then
  set -a
  # shellcheck disable=SC1091
  . ./.env
  set +a
fi

echo "Starting server..."
exec uvicorn main:app --port 8000
