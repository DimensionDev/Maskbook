module.exports = {
    serialize(val, config, indentation, depth, refs, printer) {
        if (val instanceof Uint8Array) {
            return 'Uint8Array [ ' + Buffer.from(val).toString('hex') + ' ]'
        }
        if (val instanceof Error || isDOMException(val)) {
            let msg = `${val.constructor.name} {\n`
            msg += indentation + config.indent + `"message": "${val.message}"\n`
            if (val.cause) {
                const cause = printer(val.cause, config, indentation + config.indent, depth, refs)
                msg += indentation + config.indent + `"cause": ${cause}\n`
            }
            msg += indentation + '}'
            return msg
        }
        if (isCryptoKey(val)) return `CryptoKey { [opaque crypto key material] }`
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
        if (isDOMException(val)) return true
        if (val instanceof Error) return true
        return Object.hasOwn(val, 'ok') || Object.hasOwn(val, 'none')
    },
}

function isDOMException(a) {
    try {
        return a.constructor.name === 'DOMException'
    } catch {}
}
function isCryptoKey(a) {
    try {
        return a.constructor.name === 'CryptoKey' || a.constructor.name === 'EcCryptoKey'
    } catch {}
}
