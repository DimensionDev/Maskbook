#!/usr/bin/env node
import { spawnSync } from 'child_process'
const child = spawnSync(
    process.execPath,
    ['--loader', 'ts-node/esm/transpile-only', import.meta.resolve('./dev.ts'), ...process.argv.slice(2)],
    { stdio: 'inherit' },
)
if (child.status) process.exit(child.status)
