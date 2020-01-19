globalThis.location = { hostname: 'localhost' }
globalThis.navigator = { appVersion: '', userAgent: '', language: '', platform: '' }
globalThis.document = {
    adoptedStyleSheets: {},
    getElementById() {},
    createElement() {
        return {
            attachShadow() {
                return { addEventListener() {} }
            },
        }
    },
    body: { appendChild() {} },
    addEventListener() {},
}
globalThis.CSSStyleSheet = { name: 'CSSStyleSheet' }
globalThis.ShadowRoot = class {}
globalThis.Event = class {
    get target() {}
}
globalThis.Worker = class {}
globalThis.webpackEnv = {}
globalThis.sessionStorage = {}

const { join } = require('path')
const { writeFileSync, readFileSync } = require('fs')

const restoreLodash = modifyPackage('lodash-es', x => (x.main = '../lodash'))
const restoreAsyncCall = modifyPackage('async-call-rpc', x => {
    x.main = './_maskbook_ssr.cjs'
    x.types = './out/'
})
writeFileSync(
    join(__dirname, '../node_modules/async-call-rpc/_maskbook_ssr.cjs'),
    `exports.AsyncCall = () => new Proxy({}, {get(_target, method) {return (...params) => new Promise(x => {})}})
exports.AsyncGeneratorCall = () => new Proxy({}, {get(_target, method) {return async function* (...params) { await new Promise(x => {})}}})`,
)
const restoreKit = modifyPackage(
    '@holoflows/kit',
    x =>
        (x.exports = {
            './es/util/sleep': './umd/index.js',
            './es': './umd/index.js',
        }),
)

process.on('uncaughtException', function(err) {
    cleanup()
    throw err
})
function cleanup() {
    restoreLodash()
    restoreAsyncCall()
    restoreKit()
}
try {
    require('ts-node').register({ ...require(__dirname + '/../tsconfig_cjs.json'), transpileOnly: true })
    module.exports = require(process.argv[process.argv.length - 1])
} finally {
    cleanup()
}

function modifyPackage(packageName, modifier) {
    const path = join(__dirname, `../node_modules/${packageName}/package.json`)
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
