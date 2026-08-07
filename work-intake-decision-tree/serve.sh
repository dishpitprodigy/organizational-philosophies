#!/usr/bin/env sh
# THROWAWAY PROTOTYPE server. No build step or dependencies.
cd "$(dirname "$0")" || exit 1
python3 -m http.server 8000
