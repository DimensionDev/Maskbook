/**
 * @deprecated This version of payload is not in use.
 * Please goto Crypto alpha v38
 */
import {
    encodeText,
    encodeArrayBuffer,
    decodeArrayBuffer,
    decodeText,
} from '../utils/type-transform/String-ArrayBuffer'
import { toECDH, addUint8Array, toECDSA } from '../utils/type-transform/ECDSA-ECDH'
import { memoizePromise } from '../utils/memoize'
import { geti18nString } from '../utils/i18n'
import {
    generate_AES_GCM_256_Key,
    import_AES_GCM_256_Key,
    import_PBKDF2_Key,
    derive_AES_GCM_256_Key_From_ECDH_256k1_Keys,
    derive_AES_GCM_256_Key_From_PBKDF2,
} from '../utils/crypto.subtle'
export type PublishedAESKey = { encryptedKey: string; salt: string }
export type PublishedAESKeyRecordV40 = {
    key: PublishedAESKey
    name: string
}
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
    const derivedKey = await derive_AES_GCM_256_Key_From_ECDH_256k1_Keys(op, pr)

    const _salt = typeof salt === 'string' ? decodeArrayBuffer(salt) : salt
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
        // eslint-disable-next-line no-bitwise
        iv[i] = iv_pre[i] ^ iv_pre[16 + i]
    }
    const key = await import_AES_GCM_256_Key(password)
    return { key, salt: _salt, iv }
}
//#endregion
//#region encrypt text
/**
 * Encrypt 1 to 1
 */
export async function encrypt1To1(info: {
    version: -38
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
export async function generateOthersAESKeyEncrypted(
    version: -40,
    AESKey: CryptoKey,
    privateKeyECDH: CryptoKey,
    othersPublicKeyECDH: { key: CryptoKey; name: string }[],
): Promise<PublishedAESKeyRecordV40[]> {
    const exportedAESKey = encodeText(JSON.stringify(await crypto.subtle.exportKey('jwk', AESKey)))
    return Promise.all(
        othersPublicKeyECDH.map<Promise<PublishedAESKeyRecordV40>>(async ({ key, name }) => {
            const encrypted = await encrypt1To1({
                // This is the deprecated -40 code path
                version: (-40 as unknown) as -38,
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
    othersAESKeyEncrypted: PublishedAESKeyRecordV40[]
    /** The raw post AESKey. Be aware to protect it! */
    postAESKey: CryptoKey
}> {
    const { version, content, othersPublicKeyECDH, privateKeyECDH, ownersLocalKey, iv } = info
    const AESKey = await generate_AES_GCM_256_Key()
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
    const othersAESKeyEncrypted = await generateOthersAESKeyEncrypted(-40, AESKey, privateKeyECDH, othersPublicKeyECDH)
    return { encryptedContent, iv, version: -40, ownersAESKeyEncrypted, othersAESKeyEncrypted, postAESKey: AESKey }
}
//#endregion
//#region decrypt text
/**
 * Decrypt 1 to 1
 */
export async function decryptMessage1To1(info: {
    version: -40 | -39 | -38
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
    version: -40 | -39 | -38
    encryptedContent: string | ArrayBuffer
    privateKeyECDH: CryptoKey
    authorsPublicKeyECDH: CryptoKey
    AESKeyEncrypted: PublishedAESKey | PublishedAESKey[]
    iv: ArrayBuffer | string
}): Promise<[ArrayBuffer, CryptoKey]> {
    const { encryptedContent, privateKeyECDH, authorsPublicKeyECDH, iv } = info
    const AESKeyEncrypted = Array.isArray(info.AESKeyEncrypted) ? info.AESKeyEncrypted : [info.AESKeyEncrypted]

    let resolvedAESKey: string | null = null
    await Promise.all(
        AESKeyEncrypted.map(async key => {
            try {
                const result = await decryptMessage1To1({
                    version: -40,
                    salt: key.salt,
                    encryptedContent: key.encryptedKey,
                    anotherPublicKeyECDH: authorsPublicKeyECDH,
                    privateKeyECDH: privateKeyECDH,
                })
                resolvedAESKey = decodeText(result)
            } catch {}
        }),
    )
    if (resolvedAESKey === null) throw new Error(geti18nString('service_not_share_target'))
    const aesKey = await import_AES_GCM_256_Key(JSON.parse(resolvedAESKey))
    return [await decryptWithAES({ aesKey, iv, encrypted: encryptedContent }), aesKey]
}
export async function extractAESKeyInMessage(
    version: -40 | -39 | -38,
    encodedEncryptedKey: string | ArrayBuffer,
    _iv: string | ArrayBuffer,
    myLocalKey: CryptoKey,
): Promise<CryptoKey> {
    const iv = typeof _iv === 'string' ? decodeArrayBuffer(_iv) : _iv
    const encryptedKey =
        typeof encodedEncryptedKey === 'string' ? decodeArrayBuffer(encodedEncryptedKey) : encodedEncryptedKey
    const decryptedAESKeyJWK = JSON.parse(
        decodeText(await decryptWithAES({ aesKey: myLocalKey, iv, encrypted: encryptedKey })),
    )
    return import_AES_GCM_256_Key(decryptedAESKeyJWK)
}
/**
 * Decrypt 1 to N message that send by myself
 */
export async function decryptMessage1ToNByMyself(info: {
    version: -40 | -39 | -38
    encryptedContent: string | ArrayBuffer
    /** This should be included in the message */
    encryptedAESKey: string | ArrayBuffer
    myLocalKey: CryptoKey
    iv: string | ArrayBuffer
}): Promise<[ArrayBuffer, CryptoKey]> {
    const { encryptedContent, myLocalKey, iv, encryptedAESKey } = info
    const decryptedAESKey = await extractAESKeyInMessage(-40, encryptedAESKey, iv, myLocalKey)
    const post = await decryptWithAES({ aesKey: decryptedAESKey, encrypted: encryptedContent, iv })
    return [post, decryptedAESKey]
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

//#region Comment
function extractCommentPayload(text: string) {
    const [_, toEnd] = text.split('🎶2/4|')
    const [content, _2] = (toEnd || '').split(':||')
    if (content.length) return content
    return
}
const getCommentKey = memoizePromise(
    async function(postIV: string, postContent: string) {
        const pbkdf = await import_PBKDF2_Key(encodeText(postContent))
        const aes = await derive_AES_GCM_256_Key_From_PBKDF2(pbkdf, encodeText(postIV))
        return aes
    },
    (a, b) => a + b,
)
// * Payload format: 🎶2/4|encrypted_comment:||
export async function encryptComment(
    postIV: string | ArrayBuffer,
    postContent: string | ArrayBuffer,
    comment: string | ArrayBuffer,
) {
    if (typeof postIV !== 'string') postIV = encodeArrayBuffer(postIV)
    if (typeof postContent !== 'string') postContent = decodeText(postContent)
    const key = await getCommentKey(postIV, postContent)
    const x = await encryptWithAES({
        content: comment,
        aesKey: key,
        iv: decodeArrayBuffer(postIV),
    })
    return `🎶2/4|${encodeArrayBuffer(x.content)}:||`
}
export async function decryptComment(
    postIV: string | ArrayBuffer,
    postContent: string | ArrayBuffer,
    encryptComment: string | ArrayBuffer,
) {
    if (typeof postIV !== 'string') postIV = encodeArrayBuffer(postIV)
    if (typeof postContent !== 'string') postContent = decodeText(postContent)
    if (typeof encryptComment !== 'string') encryptComment = decodeText(encryptComment)
    const payload = extractCommentPayload(encryptComment)
    if (!payload) return
    const key = await getCommentKey(postIV, postContent)
    try {
        const x = await decryptWithAES({
            aesKey: key,
            iv: decodeArrayBuffer(postIV),
            encrypted: payload,
        })
        return decodeText(x)
    } catch {
        return undefined
    }
}
//#endregion
