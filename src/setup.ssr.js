globalThis.location = { hostname: 'localhost' }
globalThis.navigator = { appVersion: '', userAgent: '', language: '', platform: 'ssr' }
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
