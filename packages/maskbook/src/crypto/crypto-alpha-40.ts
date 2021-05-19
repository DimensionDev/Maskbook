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
import { memoizePromise } from '../utils/memoize'
import { makeTypedMessageText } from '../protocols/typed-message'
import { i18n } from '../utils/i18n-next'
import { CryptoWorker } from '../modules/workers'
import type {
    EC_Private_JsonWebKey,
    EC_Public_JsonWebKey,
    AESJsonWebKey,
} from '../modules/CryptoAlgorithm/interfaces/utils'
import {
    derive_AES_GCM_256_Key_From_PBKDF2,
    derive_AES_GCM_256_Key_From_ECDH_256k1_Keys,
} from '../modules/CryptoAlgorithm/helper'
import { addUint8Array } from '../utils/utils'
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
    privateKey: EC_Private_JsonWebKey,
    othersPublicKey: EC_Public_JsonWebKey,
    /** If salt is not provided, we will generate one. And you should send it to your friend. */
    salt: ArrayBuffer | string = crypto.getRandomValues(new Uint8Array(64)),
): Promise<{ iv: ArrayBuffer; salt: ArrayBuffer; key: AESJsonWebKey }> {
    const op = othersPublicKey
    const pr = privateKey
    const derivedKey = await CryptoWorker.aes_to_raw(await derive_AES_GCM_256_Key_From_ECDH_256k1_Keys(pr, op))

    const _salt = typeof salt === 'string' ? decodeArrayBuffer(salt) : salt
    const UntitledUint8Array = addUint8Array(new Uint8Array(derivedKey), _salt)
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
    const key = await CryptoWorker.raw_to_aes(password)
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
    privateKeyECDH: EC_Private_JsonWebKey
    /** Other's public key */
    othersPublicKeyECDH: EC_Public_JsonWebKey
}): Promise<{
    version: -40
    encryptedContent: ArrayBuffer
    salt: ArrayBuffer
}> {
    const { version, privateKeyECDH, othersPublicKeyECDH } = info
    let { content } = info
    if (typeof content === 'string') content = encodeText(content)

    const { iv, key, salt } = await deriveAESKey(privateKeyECDH, othersPublicKeyECDH)
    const encryptedContent = await CryptoWorker.encrypt_aes_gcm(key, iv, content)
    return { salt, encryptedContent, version: -40 }
}
export async function generateOthersAESKeyEncrypted(
    version: -40,
    AESKey: AESJsonWebKey,
    privateKeyECDH: EC_Private_JsonWebKey,
    othersPublicKeyECDH: { key: EC_Public_JsonWebKey; name: string }[],
): Promise<PublishedAESKeyRecordV40[]> {
    const exportedAESKey = encodeText(JSON.stringify(AESKey))
    return Promise.all(
        othersPublicKeyECDH.map<Promise<PublishedAESKeyRecordV40>>(async ({ key, name }) => {
            const encrypted = await encrypt1To1({
                // This is the deprecated -40 code path
                version: -40 as unknown as -38,
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
    privateKeyECDH: EC_Private_JsonWebKey
    /** Your local AES key, used to encrypt the random AES key to decrypt the post by yourself */
    ownersLocalKey: AESJsonWebKey
    /** Other's public keys. For everyone, will use 1 to 1 encryption to encrypt the random aes key */
    othersPublicKeyECDH: { key: EC_Public_JsonWebKey; name: string }[]
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
    postAESKey: AESJsonWebKey
}> {
    const { version, content, othersPublicKeyECDH, privateKeyECDH, ownersLocalKey, iv } = info
    const AESKey = await CryptoWorker.generate_aes_gcm()

    const encryptedContent = await CryptoWorker.encrypt_aes_gcm(
        AESKey,
        iv,
        typeof content === 'string' ? encodeText(content) : content,
    )

    const exportedAESKey = encodeText(JSON.stringify(AESKey))
    const ownersAESKeyEncrypted = (
        await encryptWithAES({
            aesKey: ownersLocalKey,
            content: exportedAESKey,
            iv,
        })
    ).content
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
    privateKeyECDH: EC_Private_JsonWebKey
    /** If you are the author, this should be the receiver's public key.
     * Otherwise, this should be the author's public key */
    anotherPublicKeyECDH: EC_Public_JsonWebKey
}): Promise<ArrayBuffer> {
    const { anotherPublicKeyECDH, version, salt, encryptedContent, privateKeyECDH } = info
    const encrypted = typeof encryptedContent === 'string' ? decodeArrayBuffer(encryptedContent) : encryptedContent

    const { iv, key } = await deriveAESKey(privateKeyECDH, anotherPublicKeyECDH, salt)
    return CryptoWorker.decrypt_aes_gcm(key, iv, encrypted)
}
/**
 * Decrypt 1 to N message that send by other
 */
export async function decryptMessage1ToNByOther(info: {
    version: -40 | -39 | -38
    encryptedContent: string | ArrayBuffer
    privateKeyECDH: EC_Private_JsonWebKey
    authorsPublicKeyECDH: EC_Public_JsonWebKey
    AESKeyEncrypted: PublishedAESKey | PublishedAESKey[]
    iv: ArrayBuffer | string
}): Promise<[ArrayBuffer, AESJsonWebKey]> {
    const { encryptedContent, privateKeyECDH, authorsPublicKeyECDH, iv } = info
    const AESKeyEncrypted = Array.isArray(info.AESKeyEncrypted) ? info.AESKeyEncrypted : [info.AESKeyEncrypted]

    let resolvedAESKey: string | null = null
    await Promise.all(
        AESKeyEncrypted.map(async (key) => {
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
    if (resolvedAESKey === null) throw new Error(i18n.t('service_not_share_target'))
    const aesKey: AESJsonWebKey = JSON.parse(resolvedAESKey)
    return [await decryptWithAES({ aesKey, iv, encrypted: encryptedContent }), aesKey]
}
export async function extractAESKeyInMessage(
    version: -40 | -39 | -38,
    encodedEncryptedKey: string | ArrayBuffer,
    _iv: string | ArrayBuffer,
    myLocalKey: AESJsonWebKey,
): Promise<AESJsonWebKey> {
    const iv = typeof _iv === 'string' ? decodeArrayBuffer(_iv) : _iv
    const encryptedKey =
        typeof encodedEncryptedKey === 'string' ? decodeArrayBuffer(encodedEncryptedKey) : encodedEncryptedKey
    const decryptedAESKeyJWK = JSON.parse(
        decodeText(await decryptWithAES({ aesKey: myLocalKey, iv, encrypted: encryptedKey })),
    )
    return decryptedAESKeyJWK
}
/**
 * Decrypt 1 to N message that send by myself
 */
export async function decryptMessage1ToNByMyself(info: {
    version: -40 | -39 | -38
    encryptedContent: string | ArrayBuffer
    /** This should be included in the message */
    encryptedAESKey: string | ArrayBuffer
    myLocalKey: AESJsonWebKey
    iv: string | ArrayBuffer
}): Promise<[ArrayBuffer, AESJsonWebKey]> {
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
    aesKey: AESJsonWebKey
    iv: ArrayBuffer | string
}): Promise<ArrayBuffer> {
    const { aesKey } = info
    const iv = typeof info.iv === 'string' ? decodeArrayBuffer(info.iv) : info.iv
    const encrypted = typeof info.encrypted === 'string' ? decodeArrayBuffer(info.encrypted) : info.encrypted
    return CryptoWorker.decrypt_aes_gcm(aesKey, iv, encrypted)
}
export async function encryptWithAES(info: {
    content: string | ArrayBuffer
    aesKey: AESJsonWebKey
    iv?: ArrayBuffer
}): Promise<{ content: ArrayBuffer; iv: ArrayBuffer }> {
    const iv = info.iv ? info.iv : crypto.getRandomValues(new Uint8Array(16))
    const content = typeof info.content === 'string' ? encodeText(info.content) : info.content

    const encrypted = await CryptoWorker.encrypt_aes_gcm(info.aesKey, iv, content)
    return { content: encrypted, iv }
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
    async function (postIV: string, postContent: string) {
        const pbkdf = await CryptoWorker.import_pbkdf2(encodeText(postContent))
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
    const key = await getCommentKey(postIV as string, postContent as string)
    const x = await encryptWithAES({
        content: comment,
        aesKey: key,
        iv: decodeArrayBuffer(postIV as string),
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
    const payload = extractCommentPayload(encryptComment as string)
    if (!payload) return null
    const key = await getCommentKey(postIV as string, postContent as string)
    try {
        const x = await decryptWithAES({
            aesKey: key,
            iv: decodeArrayBuffer(postIV as string),
            encrypted: payload,
        })
        return decodeText(x)
    } catch {
        return null
    }
}
//#endregion

export function typedMessageStringify(x: any) {
    throw new Error('Not supported typed message in version older than v39.')
}
export function typedMessageParse(x: string) {
    return makeTypedMessageText(x)
}
