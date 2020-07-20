{
    const __deps__ = {}
    const proto = Object.create(null)
    Object.defineProperty(proto, '__esModule', { value: true })
    Object.defineProperty(proto, Symbol.toStringTag, { value: 'Module' })
    Object.freeze(proto)
    function _d(moduleName, ...rest) {
        const scope = __deps__[moduleName] || (__deps__[moduleName] = Object.create(proto))
        for (const x of rest) {
            if (x instanceof Promise) x.then((x) => _d(moduleName, x))
            else Object.entries(x).forEach(__.bind(scope))
        }
    }
    function __([k, v]) {
        if (v === undefined) return
        this[k] = v
    }
    Object.assign(globalThis, { __deps__, _d })
}
