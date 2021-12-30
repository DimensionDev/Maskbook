{
    const { SyntaxError } = globalThis
    const { warn } = console
    globalThis.eval = function () {
        warn(`[CSP] Try to run code "${arg0}"`)
        throw new SyntaxError(`CSP violation.`)
    }

    function newFunction(arg0) {
        if (arg0 === 'return async function*(){}()') {
            return () => (async function* () {})()
        }
        if (arg0 === 'return this') {
            warn(`[CSP] Please report this to the upstream to use globalThis instead of "${arg0}".`)
            return () => globalThis
        }
        warn(`[CSP] Try to run code "${arg0}"`)
        throw new SyntaxError(`CSP violation.`)
    }
    globalThis.Function = new Proxy(Function, {
        construct(target, [arg0], newTarget) {
            return newFunction(arg0)
        },
        apply(target, thisArg, [arg0]) {
            return newFunction(arg0)
        },
    })
}
importScripts('./worker_env.js', './polyfill/browser-polyfill.js', './js/background.js')
