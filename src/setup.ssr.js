globalThis.location = { hostname: 'localhost' }
globalThis.navigator = { appVersion: '', userAgent: '', language: '', platform: '' }
globalThis.document = {
    adoptedStyleSheets: {},
    getElementById() {},
    createElement() {
        return { attachShadow() {} }
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
module.exports = require(process.argv[process.argv.length - 1])
