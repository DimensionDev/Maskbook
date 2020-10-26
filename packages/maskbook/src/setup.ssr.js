const EventTarget = { addEventListener() {} }
globalThis.location = { hostname: 'localhost' }
globalThis.navigator = { appVersion: '', userAgent: '', language: '', platform: 'ssr' }
globalThis.document = {
    adoptedStyleSheets: {},
    getElementById() {},
    createElement() {
        return {
            attachShadow() {
                return EventTarget
            },
        }
    },
    body: { appendChild() {} },
    ...EventTarget,
    documentElement: {
        onmouseenter() {},
    },
    readyState: 'loading',
}
globalThis.CSSStyleSheet = { name: 'CSSStyleSheet' }
globalThis.ShadowRoot = class {}
globalThis.Event = class {
    get target() {}
}
globalThis.Worker = class {}
globalThis.sessionStorage = {}
globalThis.matchMedia = () => {
    return { matches: false, ...EventTarget }
}

const { join } = require('path')
const { writeFileSync, readFileSync, unlinkSync } = require('fs')

const restoreLodash = modifyPackage('lodash-es', (x) => (x.main = '../lodash'))
const restoreKit = modifyPackage('@dimensiondev/holoflows-kit', (x) => {
    x.exports = {
        '.': './umd/index.js',
        './es/util/sleep': './umd/index.js',
        './es': './umd/index.js',
        './package.json': './package.json',
    }
})
process.on('uncaughtException', function (err) {
    cleanup()
    throw err
})
process.on('unhandledRejection', (err) => {
    cleanup()
    throw err
})
function cleanup() {
    restoreLodash()
    restoreKit()
}
try {
    require('ts-node').register({
        project: require.resolve(__dirname + '/../../../tsconfig.json'),
        transpileOnly: true,
        // ignore: [],
    })
    globalThis.window = globalThis
    require('./polyfill/index')
    delete globalThis.window
    module.exports = require(process.argv[process.argv.length - 1])
} finally {
    cleanup()
}

function modifyPackage(packageName, modifier) {
    const path = join(require.resolve(packageName + '/package.json'))
    const [x, orig] = [readJSON(path), readJSON(path)]
    modifier(x)
    writeJSON(path, x)
    return () => {
        writeJSON(path, orig)
    }

    function readJSON(path) {
        return JSON.parse(readFileSync(path))
    }

    function writeJSON(path, object) {
        return writeFileSync(path, JSON.stringify(object, undefined, 4))
    }
}
