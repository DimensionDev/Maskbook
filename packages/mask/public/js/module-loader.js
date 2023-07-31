{
    const modules = new Map()
    globalThis.__mask__module__define__ ??= function define(id, module) {
        if (modules.has(id)) throw new TypeError(`Module ${id} is already defined.`)
        modules.set(id, module)
    }

    const URL = globalThis.URL
    if (typeof harden === 'function') harden(URL)

    const isWorker = typeof importScripts === 'function'
    const isMV3Worker = isWorker && typeof chrome === 'object'

    const protocol = 'mask-modules:'
    globalThis.__mask__module__reflection__ ??= async function (specifier) {
        specifier = String(specifier)

        const spec = new URL(specifier)
        if (modules.has(spec)) return modules.get(spec)

        if (spec.protocol !== protocol) throw new SyntaxError('Network Error')
        // to normalize URL
        spec.protocol = 'https:'
        spec.protocol = protocol
        specifier = spec.href

        if (isMV3Worker) {
            // it should be loaded in the mv3-preload.js
            throw new SyntaxError('Module loading is not supported in MV3 background worker.')
        } else {
            if (specifier.endsWith('.mjs')) spec.href = specifier.slice(0, -4) + '.js'
            // pathname is started "//"
            await import('/sandboxed-modules' + spec.pathname.slice(1))

            if (modules.has(specifier)) return modules.get(specifier)
            throw new SyntaxError(`Module ${specifier} is not a valid module.`)
        }
    }
}
undefined
