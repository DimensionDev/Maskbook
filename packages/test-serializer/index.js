module.exports = {
    serialize(val, config, indentation, depth, refs, printer) {
        if (val instanceof Uint8Array) {
            return 'Uint8Array [ ' + Buffer.from(val).toString('hex') + ' ]'
        }
        if (isCryptoKey(val)) return `CryptoKey { [native data] }`
        const inner = printer(val.val, config, indentation, depth, refs)
        if (val.ok) return `Ok(${inner})`
        if (val.err) return `Err(${inner})`
        if (val.none) return `None`
        if (val.some) return `Some(${inner})`
    },
    test(val) {
        if (!val) return false
        if (val instanceof Uint8Array) return true
        if (isCryptoKey(val)) return true
        return Object.hasOwn(val, 'ok') || Object.hasOwn(val, 'none')
    },
}
function isCryptoKey(a) {
    try {
        return a.constructor.name === 'CryptoKey'
    } catch {}
}
