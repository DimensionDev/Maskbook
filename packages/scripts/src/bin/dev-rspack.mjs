#!/usr/bin/env node
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const child = spawnSync(
    process.execPath,
    [
        '--experimental-strip-types',
        '--disable-warning=ExperimentalWarning',
        fileURLToPath(import.meta.resolve('./dev-rspack.ts')),
        ...process.argv.slice(2),
    ],
    { stdio: 'inherit' },
)
if (child.status) process.exit(child.status)
