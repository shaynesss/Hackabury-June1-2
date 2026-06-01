#!/bin/bash
set -e
cd "$(dirname "$0")"

# Clear macOS quarantine flags from venv on every launch
# (new pip installs re-add the flag, causing 200s+ import delays)
xattr -rd com.apple.quarantine venv 2>/dev/null || true

source venv/bin/activate
exec uvicorn main:app --reload --port 8000
