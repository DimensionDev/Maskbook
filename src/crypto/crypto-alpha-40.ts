import { encodeText, encodeArrayBuffer, decodeArrayBuffer, decodeText } from '../utils/EncodeDecode'
import { toECDH, addUint8Array, toECDSA } from '../utils/CryptoUtils'
// tslint:disable: no-parameter-reassignment
export type PublishedAESKey = { encryptedKey: string; salt: string }
//#region Derive AES Key from ECDH key
/**
 * Derive the key from your private ECDH key and someone else's ECDH key.
 * If the key is ECDSA, it will be transform to ECDH.
 *
 * If you provide the same privateKey, othersPublicKey and salt, the results will be the same.
 * @param privateKey Your private key
 * @param othersPublicKey Public key of someone you want to derive key to
 * @param salt Salt
 */
async function deriveAESKey(
    privateKey: CryptoKey,
    othersPublicKey: CryptoKey,
    /** If salt is not provided, we will generate one. And you should send it to your friend. */
    salt: ArrayBuffer | string = crypto.getRandomValues(new Uint8Array(64)),
) {
    const op = othersPublicKey.usages.find(x => x === 'deriveKey') ? othersPublicKey : await toECDH(othersPublicKey)
    const pr = privateKey.usages.find(x => x === 'deriveKey') ? privateKey : await toECDH(privateKey)
    const derivedKey = await crypto.subtle.deriveKey(
        { name: 'ECDH', public: op },
        pr,
        { name: 'AES-GCM', length: 256 },
        true,
        ['encrypt', 'decrypt'],
    )

    const _salt = typeof salt === 'string' ? decodeArrayBuffer(salt) : salt
    // TODO: Need a name.
    const UntitledUint8Array = addUint8Array(new Uint8Array(await crypto.subtle.exportKey('raw', derivedKey)), _salt)
    const password = await crypto.subtle.digest(
        'SHA-256',
        addUint8Array(addUint8Array(UntitledUint8Array, _salt), decodeArrayBuffer('KEY')),
    )
    const iv_pre = new Uint8Array(
        await crypto.subtle.digest(
            'SHA-256',
            addUint8Array(addUint8Array(UntitledUint8Array, _salt), decodeArrayBuffer('IV')),
        ),
    )
    const iv = new Uint8Array(16)
    for (let i = 0; i <= 16; i += 1) {
        // tslint:disable-next-line: no-bitwise
        iv[i] = iv_pre[i] ^ iv_pre[16 + i]
    }
    const key = await crypto.subtle.importKey('raw', password, { name: 'AES-GCM', length: 256 }, true, [
        'encrypt',
        'decrypt',
    ])
    return { key, salt: _salt, iv }
}
//#endregion
//#region encrypt text
/**
 * Encrypt 1 to 1
 */
export async function encrypt1To1(info: {
    version: -40
    /** Message that you want to encrypt */
    content: string | ArrayBuffer
    /** Your private key */
    privateKeyECDH: CryptoKey
    /** Other's public key */
    othersPublicKeyECDH: CryptoKey
}): Promise<{
    version: -40
    encryptedContent: ArrayBuffer
    salt: ArrayBuffer
}> {
    const { version, privateKeyECDH, othersPublicKeyECDH } = info
    let { content } = info
    if (typeof content === 'string') content = encodeText(content)

    const { iv, key, salt } = await deriveAESKey(privateKeyECDH, othersPublicKeyECDH)
    const encryptedContent = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, content)
    return { salt, encryptedContent, version: -40 }
}
/**
 * Encrypt 1 to N
 */
export async function encrypt1ToN(info: {
    version: -40
    /** Message to encrypt */
    content: string | ArrayBuffer
    /** Your private key */
    privateKeyECDH: CryptoKey
    /** Your local AES key, used to encrypt the random AES key to decrypt the post by yourself */
    ownersLocalKey: CryptoKey
    /** Other's public keys. For everyone, will use 1 to 1 encryption to encrypt the random aes key */
    othersPublicKeyECDH: { key: CryptoKey; name: string }[]
    /** iv */
    iv: ArrayBuffer
}): Promise<{
    version: -40
    encryptedContent: ArrayBuffer
    iv: ArrayBuffer
    /** Your encrypted post aes key. Should be attached in the post. */
    ownersAESKeyEncrypted: ArrayBuffer
    /** All encrypted post aes key. Should be post on the gun. */
    othersAESKeyEncrypted: {
        key: PublishedAESKey
        name: string
    }[]
}> {
    const { version, content, othersPublicKeyECDH, privateKeyECDH, ownersLocalKey, iv } = info
    const AESKey = await crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, true, ['encrypt', 'decrypt'])
    const encryptedContent = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv },
        AESKey,
        typeof content === 'string' ? encodeText(content) : content,
    )

    const exportedAESKey = encodeText(JSON.stringify(await crypto.subtle.exportKey('jwk', AESKey)))
    const ownersAESKeyEncrypted = (await encryptWithAES({
        aesKey: ownersLocalKey,
        content: exportedAESKey,
        iv,
    })).content
    const othersAESKeyEncrypted = await Promise.all(
        othersPublicKeyECDH.map<
            Promise<{
                key: PublishedAESKey
                name: string
            }>
        >(async ({ key, name }) => {
            const encrypted = await encrypt1To1({
                version: -40,
                content: exportedAESKey,
                othersPublicKeyECDH: key,
                privateKeyECDH: privateKeyECDH,
            })
            return {
                name,
                key: {
                    version: -40,
                    salt: encodeArrayBuffer(encrypted.salt),
                    encryptedKey: encodeArrayBuffer(encrypted.encryptedContent),
                },
            }
        }),
    )

    return { encryptedContent, iv, version: -40, ownersAESKeyEncrypted, othersAESKeyEncrypted }
}
//#endregion
//#region decrypt text
/**
 * Decrypt 1 to 1
 */
export async function decryptMessage1To1(info: {
    version: -40
    encryptedContent: string | ArrayBuffer
    salt: string | ArrayBuffer
    /** Your private key */
    privateKeyECDH: CryptoKey
    /** If you are the author, this should be the receiver's public key.
     * Otherwise, this should be the author's public key */
    anotherPublicKeyECDH: CryptoKey
}): Promise<ArrayBuffer> {
    const { anotherPublicKeyECDH, version, salt, encryptedContent, privateKeyECDH } = info
    const encrypted = typeof encryptedContent === 'string' ? decodeArrayBuffer(encryptedContent) : encryptedContent

    const { iv, key } = await deriveAESKey(privateKeyECDH, anotherPublicKeyECDH, salt)
    return crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, encrypted)
}
/**
 * Decrypt 1 to N message that send by other
 */
export async function decryptMessage1ToNByOther(info: {
    version: -40
    encryptedContent: string | ArrayBuffer
    privateKeyECDH: CryptoKey
    authorsPublicKeyECDH: CryptoKey
    AESKeyEncrypted: PublishedAESKey
    iv: ArrayBuffer | string
}): Promise<ArrayBuffer> {
    const { AESKeyEncrypted, version, encryptedContent, privateKeyECDH, authorsPublicKeyECDH, iv } = info
    const aesKeyJWK = decodeText(
        await decryptMessage1To1({
            version: -40,
            salt: AESKeyEncrypted.salt,
            encryptedContent: AESKeyEncrypted.encryptedKey,
            anotherPublicKeyECDH: authorsPublicKeyECDH,
            privateKeyECDH: privateKeyECDH,
        }),
    )
    const aesKey = await crypto.subtle.importKey(
        'jwk',
        JSON.parse(aesKeyJWK),
        { name: 'AES-GCM', length: 256 },
        false,
        ['decrypt'],
    )
    return decryptWithAES({ aesKey, iv, encrypted: encryptedContent })
}
/**
 * Decrypt 1 to N message that send by myself
 */
export async function decryptMessage1ToNByMyself(info: {
    version: -40
    encryptedContent: string | ArrayBuffer
    /** This should be included in the message */
    encryptedAESKey: string | ArrayBuffer
    myLocalKey: CryptoKey
    iv: string | ArrayBuffer
}): Promise<ArrayBuffer> {
    const { encryptedContent, myLocalKey, version } = info
    const iv = typeof info.iv === 'string' ? decodeArrayBuffer(info.iv) : info.iv
    const encryptedAESKey =
        typeof info.encryptedAESKey === 'string' ? decodeArrayBuffer(info.encryptedAESKey) : info.encryptedAESKey

    const decryptedAESKeyJWK = JSON.parse(
        decodeText(await decryptWithAES({ aesKey: myLocalKey, iv, encrypted: encryptedAESKey })),
    )
    const decryptedAESKey = await crypto.subtle.importKey(
        'jwk',
        decryptedAESKeyJWK,
        { name: 'AES-GCM', length: 256 },
        false,
        ['decrypt'],
    )
    const post = await decryptWithAES({ aesKey: decryptedAESKey, encrypted: encryptedContent, iv })
    return post
}
/**
 * Decrypt the content encrypted by AES
 */
export async function decryptWithAES(info: {
    encrypted: string | ArrayBuffer
    aesKey: CryptoKey
    iv: ArrayBuffer | string
}): Promise<ArrayBuffer> {
    const { aesKey } = info
    const iv = typeof info.iv === 'string' ? decodeArrayBuffer(info.iv) : info.iv
    const encrypted = typeof info.encrypted === 'string' ? decodeArrayBuffer(info.encrypted) : info.encrypted
    return crypto.subtle.decrypt({ name: 'AES-GCM', iv }, aesKey, encrypted)
}
export async function encryptWithAES(info: {
    content: string | ArrayBuffer
    aesKey: CryptoKey
    iv?: ArrayBuffer
}): Promise<{ content: ArrayBuffer; iv: ArrayBuffer }> {
    const iv = info.iv ? info.iv : crypto.getRandomValues(new Uint8Array(16))
    const content = typeof info.content === 'string' ? encodeText(info.content) : info.content

    const encrypted = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, info.aesKey, content)
    return { content: encrypted, iv }
}
//#endregion
//#region Sign & verify
export async function sign(message: string | ArrayBuffer, privateKey: CryptoKey): Promise<ArrayBuffer> {
    const ecdsakey = privateKey.usages.indexOf('sign') !== -1 ? privateKey : await toECDSA(privateKey)
    if (typeof message === 'string') message = encodeText(message)
    return crypto.subtle.sign({ name: 'ECDSA', hash: { name: 'SHA-256' } }, ecdsakey, message)
}
export async function verify(
    content: string | ArrayBuffer,
    signature: string | ArrayBuffer,
    publicKey: CryptoKey,
): Promise<boolean> {
    if (typeof signature === 'string') signature = decodeArrayBuffer(signature)
    if (typeof content === 'string') content = encodeText(content)

    const ecdsakey = publicKey.usages.indexOf('verify') !== -1 ? publicKey : await toECDSA(publicKey)
    return crypto.subtle.verify({ name: 'ECDSA', hash: { name: 'SHA-256' } }, ecdsakey, signature, content)
}
//#endregion
