import { fileURLToPath } from 'url'
import builder from 'core-js-builder'
import { rollup } from 'rollup'
import { readFile, writeFile } from 'fs/promises'
import { createRequire } from 'module'
import { createHash } from 'crypto'

// https://github.com/rollup/rollup/issues/4253
// import loadConfigFile from 'rollup/dist/loadConfigFile.js'
function loadConfigFile(...args) {
    // https://github.com/rollup/rollup/issues/4253
    const privateRequire = createRequire(require.resolve('rollup'))
    return privateRequire('./loadConfigFile.js')(...args)
}

const require = createRequire(import.meta.url)
let polyfillVersion = '__'
{
    const lockfilePath = fileURLToPath(new URL('../../pnpm-lock.yaml', import.meta.url))
    const lockfile = await readFile(lockfilePath)
    const hash = createHash('sha256')
    hash.update(lockfile)
    polyfillVersion = 'v3' + hash.digest('hex')
}

const versionFilePath = fileURLToPath(new URL('./dist/version.txt', import.meta.url))
if ((await readFile(versionFilePath, 'utf-8').catch(() => '')) === polyfillVersion) process.exit(0)

await builder({
    modules: ['es', 'web'],
    targets: [
        'iOS >= 14.0',
        // Android
        'Firefox >= 91',
        'last 2 Chrome versions',
        'last 2 Firefox versions',
    ],
    summary: {
        comment: { size: false, modules: true },
    },
    filename: fileURLToPath(new URL('./dist/ecmascript.js', import.meta.url)),
})

process.chdir(fileURLToPath(new URL('./dist/', import.meta.url)))

const { options, warnings } = await loadConfigFile(fileURLToPath(new URL('./rollup.config.js', import.meta.url)), {
    format: 'es',
})
warnings.flush()
for (const optionsObj of options) {
    const bundle = await rollup(optionsObj)
    await Promise.all(optionsObj.output.map(bundle.write))
}

const elliptic = await readFile(fileURLToPath(new URL('./dist/internal_elliptic.js', import.meta.url)), 'utf-8')
const liner = await readFile(require.resolve('webcrypto-liner/build/webcrypto-liner.shim.min.mjs'), 'utf-8')
await writeFile(
    fileURLToPath(new URL('./dist/secp256k1.js', import.meta.url)),
    `${elliptic};
${liner};`,
)

await normalize(new URL('./dist/dom.js', import.meta.url))
await normalize(new URL('./dist/ecmascript.js', import.meta.url))
await normalize(new URL('./dist/intl.js', import.meta.url))
await normalize(new URL('./dist/secp256k1.js', import.meta.url))
await normalize(new URL('./dist/worker.js', import.meta.url))

await writeFile(versionFilePath, polyfillVersion)

/**
 * In Firefox, the completion value will be used as the result of the browser.tabs.executeScript,
 * and it will try to report the completion value to the background.
 *
 * If the value is a non-clonable value, it will reject the Promise.
 * By adding a ";null;" in the end to fix this problem.
 *
 * This function also wraps the polyfill in an IIFE to avoid variable leaking
 * @param {string} fileName
 */
async function normalize(fileName) {
    const file = await readFile(fileName, 'utf-8')
    await writeFile(fileName, `;(() => {${file}})(); null;`)
}
