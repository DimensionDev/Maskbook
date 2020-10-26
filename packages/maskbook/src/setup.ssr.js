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

process.on('uncaughtException', function (err) {
    throw err
})
process.on('unhandledRejection', (err) => {
    throw err
})
require('ts-node').register({
    project: require.resolve(__dirname + '/../../../tsconfig.json'),
    transpileOnly: true,
})
globalThis.window = globalThis
require('./polyfill/index')
delete globalThis.window
module.exports = require(process.argv[process.argv.length - 1])
