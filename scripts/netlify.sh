#!/bin/bash
set -xeuo pipefail
test "$CI" = true || exit 1
npx pnpm install -r --store=node_modules/.pnpm-store
node ./node_modules/.pnpm/esbuild@0.9.3/install.js || echo esbuild might failed
cd packages/cli/build || exit 2
npx gulp buildNetlify
