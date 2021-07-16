// Usage: Paste this file into your browser.
// Must be https:// or localhost.

// Encode:
// tm = await encodeTypedMessage(makeText('hello world!'))
// result = await encodePayload37({ typedMessage: tm })

// Decode:
// decodeTypedMessage(result)

var TextFormat = { PlainText: 0, Markdown: 1 }
async function encodeTypedMessage(...messages) {
    let MessagePack = await import('https://cdn.skypack.dev/@msgpack/msgpack')
    let document = [0, messages]
    let result = MessagePack.encode(document)
    return result
}
function makeText(text, metadata = null, format) {
    const m = [1, metadata, text]
    if (format) m.push(format)
    return m
}
function makeTuple(metadata = null, ...messages) {
    return [0, metadata, messages]
}
/**
 * Encode a TypedMessage into binary
 * @param options Can have options: author, authorNetwork, authorECKey, typedMessage
 * @returns
 */
async function encodePayload37(options = {}) {
    let MessagePack = await import('https://cdn.skypack.dev/@msgpack/msgpack')
    let {
        author = 'example',
        authorNetwork = 1,
        authorECKey = await crypto.subtle.generateKey({ name: 'ECDSA', namedCurve: 'P-256' }, true, ['sign', 'verify']),
        typedMessage = new Uint8Array([
            146, 0, 145, 148, 1, 129, 176, 99, 111, 109, 46, 101, 120, 97, 109, 112, 108, 101, 46, 116, 101, 115, 116,
            162, 104, 105, 172, 72, 101, 108, 108, 111, 44, 32, 119, 111, 114, 108, 100, 1,
        ]),
    } = options
    typedMessage = await typedMessage

    // Encrypt TypedMessage
    let postAESKey = await crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, true, ['encrypt', 'decrypt'])
    let postAESKeyJWK = await crypto.subtle.exportKey('jwk', postAESKey)
    let iv = crypto.getRandomValues(new Uint8Array(16))
    let encryptedTypedMessage = new Uint8Array(
        await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, postAESKey, typedMessage),
    )

    // Construct payload 37
    let authorECPublicKey_spki = new Uint8Array(await crypto.subtle.exportKey('spki', authorECKey.publicKey))
    let compressedJWK = [postAESKeyJWK.alg, postAESKeyJWK.k]
    let payload37_object = [
        -37,
        authorNetwork,
        author,
        1, // P-256
        authorECPublicKey_spki,
        [
            0, // public shared
            compressedJWK,
            iv,
        ],
        encryptedTypedMessage,
    ]
    let payload37 = MessagePack.encode(payload37_object)

    // Sign
    let signature = new Uint8Array(
        await crypto.subtle.sign({ name: 'ECDSA', hash: 'SHA-256' }, authorECKey.privateKey, payload37),
    )
    let signatureContainer = [0, payload37, signature]
    let result = MessagePack.encode(signatureContainer)

    let debugInfo = {
        authorECPublicKey: authorECPublicKey_spki,
        postAESKey: `(size ${compressedJWK.join(', ').length}) ${compressedJWK}`,
        iv,
        typedMessage,
        encryptedTypedMessage,
        payload37: payload37,
        signature,
        result,
    }
    for (let i in debugInfo) {
        if (debugInfo[i] instanceof Uint8Array) debugInfo[i] = debugUint8Array(debugInfo[i])
    }
    console.table(debugInfo)
    return result
}

async function decodePayload37(result) {
    let MessagePack = await import('https://cdn.skypack.dev/@msgpack/msgpack')

    let [signatureContainerVersion, payloadEncoded, signature] = MessagePack.decode(result)
    let [version, authorNetwork, author, authorPublicKeyAlg, authorECPublicKey_spki, encryption, data] =
        MessagePack.decode(payloadEncoded)

    if (encryption[0] !== 0) throw new Error('PeerToPeer encryption is not supported in this demo')
    if (authorPublicKeyAlg !== 1) throw new Error('Algorithm other than P-256 is not supported in this demo')

    let authorECPublicKey = await crypto.subtle.importKey(
        'spki',
        authorECPublicKey_spki,
        { name: 'ECDSA', namedCurve: 'P-256' },
        true,
        ['verify'],
    )
    let verifyResult = await crypto.subtle.verify(
        { name: 'ECDSA', hash: 'SHA-256' },
        authorECPublicKey,
        signature,
        payloadEncoded,
    )

    // decrypt
    let [encryptionKind, AESKey, iv] = encryption
    function toJsonWebKey(key) {
        const k = { ext: true, key_ops: ['encrypt', 'decrypt'], kty: 'oct' }
        k.alg = key[0]
        k.k = key[1]
        return k
    }
    let postAESKeyJWK = toJsonWebKey(AESKey)
    let postAESKey = await crypto.subtle.importKey('jwk', postAESKeyJWK, { name: 'AES-GCM' }, true, [
        'encrypt',
        'decrypt',
    ])
    let decrypted = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, postAESKey, data)

    // payload
    let typedMessage = MessagePack.decode(decrypted)
    let friendlyTypedMessage = typedMessage[1].map(debugTypedMessage)

    let debugInfo = {
        verifyResult,
        authorNetwork,
        author,
        authorECPublicKey_spki,
        iv,
    }
    for (let i in debugInfo) {
        if (debugInfo[i] instanceof Uint8Array) debugInfo[i] = debugUint8Array(debugInfo[i])
    }
    console.table(debugInfo)
    return friendlyTypedMessage
}

function debugUint8Array(buffer) {
    let str = ''
    for (let i = 0; i < buffer.byteLength; i++) {
        str += String.fromCharCode(buffer[i])
    }
    return `(size ${buffer.length}) ` + btoa(str)
}
Object.defineProperty(Uint8Array.prototype, 'base64', {
    configurable: true,
    get() {
        return debugUint8Array(this)
    },
})

function debugTypedMessage(tm) {
    const [kind, meta, ...rest] = tm
    const proto = {
        [Symbol.toStringTag]:
            'TypedMessage' + (['Tuple', 'Text'][kind] ?? (typeof kind === 'number' ? ' ( unknown kind)' : kind)),
    }
    const o = { __proto__: proto }
    if (meta) o.meta = meta

    if (kind === 1) {
        const [text, format = TextFormat.PlainText] = rest
        o.text = text
        o.format = format === TextFormat.Markdown ? 'Markdown' : 'PlainText'
    } else if (kind === 0) {
        o.items = rest[0].map(debugTypedMessage)
    } else {
        o.__unparsed__ = rest
    }
    return o
}
