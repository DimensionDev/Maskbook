#!/bin/bash
set -xeuo pipefail
test "$CI" = true || exit 1
npx pnpm install -r --store-dir=node_modules/.pnpm-store
# Hard coded...
node ./node_modules/.pnpm/esbuild@0.9.7/node_modules/esbuild/install.js
cd packages/cli/build || exit 2
npx gulp buildNetlify
