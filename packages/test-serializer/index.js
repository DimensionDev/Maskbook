import { Some, None, Ok, Err } from 'ts-results-es'
function serialize(val, config, indentation, depth, refs, printer) {
    const nextIndent = indentation + config.indent
    if (val instanceof Uint8Array) {
        return 'Uint8Array [ ' + Buffer.from(val).toString('hex') + ' ]'
    }
    if (val instanceof Error || isDOMException(val)) {
        let msg = `${val.constructor.name} {\n`
        msg += nextIndent + `"message": "${val.message}"\n`
        if (val.cause) {
            const cause = printer(val.cause, config, nextIndent, depth, refs)
            msg += nextIndent + `"cause": ${cause}\n`
        }
        msg += indentation + '}'
        return msg
    }
    if (isCryptoKey(val)) {
        // crypto.subtle.exportKey('jwk', val).then(console.log)
        return 'CryptoKey { [opaque crypto key material] }'
    }
    if (val instanceof Ok) return `Ok(${printer(val.value, config, indentation, depth, refs)})`
    if (val instanceof Err) return `Err(${printer(val.error, config, indentation, depth, refs)})`
    if (val === None) return 'None'
    if (val instanceof Some) return `Some(${printer(val.value, config, indentation, depth, refs)})`
}
function test(val) {
    if (!val) return false
    if (val instanceof Uint8Array) return true
    if (isCryptoKey(val)) return true
    if (isDOMException(val)) return true
    if (val instanceof Error) return true
    if (val instanceof Ok) return true
    if (val instanceof Err) return true
    if (val === None) return true
    if (val instanceof Some) return true
    return false
}

function isDOMException(a) {
    try {
        return a.constructor.name === 'DOMException'
    } catch {}
}
function isCryptoKey(a) {
    try {
        if (a.constructor.name === 'CryptoKey') return true
        if (a.algorithm && a.data && a.type) return true
    } catch {}
}

export const testSerializer = { serialize, test }
