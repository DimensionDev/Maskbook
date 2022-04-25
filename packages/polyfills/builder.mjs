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
    polyfillVersion = 'v1' + hash.digest('hex')
}

const versionFilePath = fileURLToPath(new URL('./dist/version.txt', import.meta.url))
if ((await readFile(versionFilePath, 'utf-8').catch(() => '')) === polyfillVersion) process.exit(0)

await builder({
    modules: ['core-js/stable'],
    targets: [
        'iOS >= 14.0',
        // Android
        'Firefox >= 99',
        'last 3 Chrome versions',
    ],
    summary: {
        comment: { size: false, modules: true },
    },
    filename: fileURLToPath(new URL('./dist/ecmascript.js', import.meta.url)),
    blacklist: undefined,
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

{
    const polyfill = fileURLToPath(new URL('./dist/ecmascript.js', import.meta.url))
    const ecmascript = await readFile(polyfill, 'utf-8')
    const regenerator = await readFile(fileURLToPath(new URL('./dist/regenerator.js', import.meta.url)), 'utf-8')

    await writeFile(polyfill, `${ecmascript};${regenerator};`)
}

await normalize(new URL('./dist/dom.js', import.meta.url))
await normalize(new URL('./dist/ecmascript.js', import.meta.url))
await normalize(new URL('./dist/intl.js', import.meta.url))
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
 * @param {string | URL} fileName
 */
async function normalize(fileName) {
    const file = await readFile(fileName, 'utf-8')
    await writeFile(fileName, `;(() => {${file}})(); null;`)
}
