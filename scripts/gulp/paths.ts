import { existsSync, mkdirSync, writeFileSync } from 'fs'
import { join } from 'path'
// Source file
export const srcPath = folder('../../src/')
// Those files must be a single file as output.
export const IsolatedEntries = {
    qrcode_worker: file('../../src/web-workers/QRCode.ts').file,
    crypto_worker: file('../../src/modules/CryptoAlgorithm/EllipticBackend/worker.ts').file,
    injected_script: file('../../src/extension/injected-script/index.ts').file,
}

// assets
export const assetsPath = folder('../../public/')
export const manifestPath = file('../../src/manifest.json')

// config
export const tsconfigESMPath = file('../../tsconfig.esm.json')

// out
export const output = {
    temp: folder('../../temp/'),
    dependencies: file('../../src/webpack.preclude.js'),
    extension: folder('../../temp/extension/'),
    esmBuild: folder('../../temp/extension/esm/'),
    systemBuild: folder('../../temp/extension/system/'),
    libraries: folder('../../temp/extension/libraries/'),
    polyfills: folder('../../temp/extension/polyfills/'),
    loaders: folder('../../temp/extension/loaders/'),
    workers: folder('../../temp/extension/isolated/'),
}

// libs
export const librariesPath = {
    ttsclib: file('../../node_modules/@magic-works/ttypescript-browser-like-import-transformer/es/ttsclib.js'),
    webExtensionSystemJS: folder('../../node_modules/@magic-works/webextension-systemjs/'),
    originalSystemJS: file('../../node_modules/systemjs/dist/s.js'),
    webExtensionPolyfill: file('../../node_modules/webextension-polyfill/dist/browser-polyfill.js'),
}
function folder(x: string, path = join(__dirname, x)) {
    return {
        folder: path,
        files: join(path, '**/*'),
        js: join(path, '**/*.js'),
        relative: (x: string) => join(path, x),
        relativeFolder: (x: string) => folder(x, path),
        ensure() {
            if (!existsSync(path)) mkdirSync(path)
        },
    }
}
function file(x: string) {
    const file = join(__dirname, x)
    return {
        file,
        relative: (x: string) => join(file, x),
        ensure: (content = '') => !existsSync(file) && writeFileSync(file, content),
    }
}
function pattern(x: string) {
    const pattern = join(__dirname, x)
    return {
        pattern,
        relative: (x: string) => join(pattern, x),
    }
}
