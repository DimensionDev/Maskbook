import { createHash } from 'node:crypto'
import { mkdir, readFile, writeFile } from 'node:fs/promises'

const lockfilePath = new URL('../../pnpm-lock.yaml', import.meta.url)
const lockfile = await readFile(lockfilePath)
const hash = createHash('sha256')
hash.update(lockfile)
const polyfillVersion = 'v3_' + hash.digest('hex')

const versionFilePath = new URL('./dist/version.txt', import.meta.url)
const built = (await readFile(versionFilePath, 'utf-8').catch(() => '')) === polyfillVersion
if (built) process.exit(0)
await mkdir(new URL('./dist/', import.meta.url)).catch(() => '')
await writeFile(versionFilePath, polyfillVersion)

export default (await import('./config.mjs')).default
