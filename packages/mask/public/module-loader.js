{
    /** @type {Map<string, any>} */
    const modules = new Map()
    globalThis.__mask__module__define__ = function define(id, module) {
        if (modules.has(id)) throw new TypeError(`Module ${id} is already defined.`)
        modules.set(id, module)
    }
    globalThis.__mask__module__get__ = modules.get.bind(modules)
}
undefined
