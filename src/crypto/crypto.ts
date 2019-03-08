// tslint:disable: await-promise

async function ECDHtoECDSA(key: CryptoKey) {
    const exported = await crypto.subtle.exportKey('jwk', key)
    return crypto.subtle.importKey('jwk', exported, { name: 'ecdsa', namedCurve: 'K-256' }, true, ['sign', 'verify'])
}
function addUint8Array(a: ArrayBuffer, b: ArrayBuffer) {
    const x = new Uint8Array(a)
    const y = new Uint8Array(b)
    const c = new Uint8Array(x.length + y.length)
    c.set(x)
    c.set(y, x.length)
    return c
}
function stringToArrayBuffer(str: string): ArrayBuffer {
    const decodedString = atob(str)
    const uintArr = []
    for (const i of decodedString) uintArr.push(i.charCodeAt(0))
    return new Uint8Array(uintArr).buffer
}
function ArrayBufferToString(buffer: ArrayBuffer) {
    const x = [...new Uint8Array(buffer)]
    const encodedString = String.fromCharCode.apply(null, x)
    return btoa(encodedString)
}
export async function generateAESKey(
    privateKeyECDH: CryptoKey,
    othersPublicKeyECDH: CryptoKey,
    /** If salt is not provided, we will generate one. And you should send it to your friend. */
    salt = crypto.getRandomValues(new Uint8Array(64)),
) {
    const derivedKey = await crypto.subtle.deriveKey(
        { name: 'ECDH', public: othersPublicKeyECDH },
        privateKeyECDH,
        { name: 'AES-CBC', length: 256 },
        true,
        ['encrypt', 'decrypt'],
    )
    // TODO: Need a name.
    const UntitledUint8Array = addUint8Array(new Uint8Array(await crypto.subtle.exportKey('raw', derivedKey)), salt)
    const password = await crypto.subtle.digest(
        'SHA-256',
        addUint8Array(addUint8Array(UntitledUint8Array, salt), stringToArrayBuffer('KEY')),
    )
    const iv_pre = new Uint8Array(
        await crypto.subtle.digest(
            'SHA-256',
            addUint8Array(addUint8Array(UntitledUint8Array, salt), stringToArrayBuffer('IV')),
        ),
    )
    const iv = new Uint8Array(16)
    for (let i = 0; i <= 16; i += 1) {
        // tslint:disable-next-line: no-bitwise
        iv[i] = iv_pre[i] ^ iv_pre[16 + i]
    }
    const AESKey = await crypto.subtle.importKey('raw', password, { name: 'AES-CBC', length: 32 }, true, [
        'encrypt',
        'decrypt',
    ])
    return { key: AESKey, salt: salt, iv }
}
export async function encryptText(content: string, privateKeyECDH: CryptoKey, othersPublicKeyECDH: CryptoKey) {
    const contentArrayBuffer = new TextEncoder().encode(content)
    const sig = await crypto.subtle.sign(
        { name: 'ECDSA', hash: { name: 'SHA-256' } },
        await ECDHtoECDSA(privateKeyECDH),
        contentArrayBuffer,
    )
    const { iv, key: AESKey, salt } = await generateAESKey(privateKeyECDH, othersPublicKeyECDH)
    const encryptedText = await crypto.subtle.encrypt({ name: 'AES-CBC', iv: iv.buffer }, AESKey, contentArrayBuffer)
    return {
        signature: ArrayBufferToString(sig),
        salt: ArrayBufferToString(salt),
        encryptedText: ArrayBufferToString(encryptedText),
    }
}
export async function decryptText(
    _encryptedText: string,
    _sign: string,
    _salt: string,
    privateKeyECDH: CryptoKey,
    othersPublicKeyECDH: CryptoKey,
) {
    const encryptText = stringToArrayBuffer(_encryptedText)
    const salt = stringToArrayBuffer(_salt)
    const signature = stringToArrayBuffer(_sign)

    const { iv, key: AESKey } = await generateAESKey(privateKeyECDH, othersPublicKeyECDH, new Uint8Array(salt))
    const decryptText = await crypto.subtle.decrypt({ name: 'AES-CBC', iv: iv.buffer }, AESKey, encryptText)
    const orig = new TextDecoder().decode(decryptText)

    const verify = await crypto.subtle.verify(
        { name: 'ECDSA', hash: { name: 'SHA-256' } },
        await ECDHtoECDSA(othersPublicKeyECDH),
        signature,
        decryptText,
    )
    return { signatureVerifyResult: verify, content: orig }
}

Object.assign(window, {
    generateAESKey,
    encryptText,
    decryptText,
})
