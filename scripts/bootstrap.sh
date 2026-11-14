#!/usr/bin/env bash
set -euo pipefail
npm install
mkdir -p public out/bridge out/emu qa
echo "Dependencies installed. Next: npm run check, then npm run stills:bridge."
