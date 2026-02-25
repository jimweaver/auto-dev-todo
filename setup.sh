#!/usr/bin/env bash
set -euo pipefail

npm install
npm run lint
npm run typecheck
npm run test
npm run build
