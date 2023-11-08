#!/usr/bin/env node
import { spawnSync } from 'child_process'
import { fileURLToPath } from 'url'
const child = spawnSync(
    process.execPath,
    ['--loader', 'swc-node/esm', fileURLToPath(new URL('./build.ts', import.meta.url)), ...process.argv.slice(2)],
    { stdio: 'inherit' },
)
if (child.status) process.exit(child.status)
