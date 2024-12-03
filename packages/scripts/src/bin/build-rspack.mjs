#!/usr/bin/env node
import { spawnSync } from 'child_process'
import { fileURLToPath } from 'url'
const child = spawnSync(
    process.execPath,
    [
        '--import',
        '@swc-node/register/esm-register',
        fileURLToPath(import.meta.resolve('./build-rspack.ts')),
        ...process.argv.slice(2),
    ],
    { stdio: 'inherit' },
)
if (child.status) process.exit(child.status)
