#!/bin/bash
set -xeuo pipefail
test "$CI" = true || exit 1
npx pnpm install -r --store=node_modules/.pnpm-store || echo skiping pnpm install
cd packages/cli/build || exit 2
npx gulp buildNetlify
