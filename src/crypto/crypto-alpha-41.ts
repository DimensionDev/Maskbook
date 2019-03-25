import { encodeText, encodeArrayBuffer, decodeArrayBuffer, decodeText } from '../utils/EncodeDecode'
import { toECDH, addUint8Array, toECDSA } from '../utils/CryptoUtils'
// tslint:disable: no-parameter-reassignment
type PromiseReturnType<T extends (...args: any[]) => Promise<any>> = T extends (...args: any[]) => Promise<infer U>
    ? U
    : never

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
    salt = crypto.getRandomValues(new Uint8Array(64)),
) {
    const op = othersPublicKey.usages.find(x => x === 'deriveKey') ? othersPublicKey : await toECDH(othersPublicKey)
    const pr = privateKey.usages.find(x => x === 'deriveKey') ? privateKey : await toECDH(privateKey)
    const derivedKey = await crypto.subtle.deriveKey(
        { name: 'ECDH', public: op },
        pr,
        { name: 'AES-CBC', length: 256 },
        true,
        ['encrypt', 'decrypt'],
    )
    // TODO: Need a name.
    const UntitledUint8Array = addUint8Array(new Uint8Array(await crypto.subtle.exportKey('raw', derivedKey)), salt)
    const password = await crypto.subtle.digest(
        'SHA-256',
        addUint8Array(addUint8Array(UntitledUint8Array, salt), decodeArrayBuffer('KEY')),
    )
    const iv_pre = new Uint8Array(
        await crypto.subtle.digest(
            'SHA-256',
            addUint8Array(addUint8Array(UntitledUint8Array, salt), decodeArrayBuffer('IV')),
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
//#endregion
//#region encrypt text
/**
 * Encrypt 1 to 1
 */
export async function encrypt1To1(info: {
    version: -41
    /** Message that you want to encrypt */
    content: string | ArrayBuffer
    /** Your private key */
    privateKeyECDH: CryptoKey
    /** Other's public key */
    othersPublicKeyECDH: CryptoKey
}): Promise<{
    version: -41
    encryptedText: string
    salt: string
}> {
    const { version, privateKeyECDH, othersPublicKeyECDH } = info
    let { content } = info

    if (typeof content === 'string') content = encodeText(content)

    const { iv, key: AESKey, salt } = await deriveAESKey(privateKeyECDH, othersPublicKeyECDH)
    const encryptedText = await crypto.subtle.encrypt({ name: 'AES-CBC', iv: iv.buffer }, AESKey, content)
    return {
        salt: encodeArrayBuffer(salt),
        encryptedText: encodeArrayBuffer(encryptedText),
        version: -41,
    }
}
/**
 * Encrypt 1 to N
 */
export async function encrypt1ToN(info: {
    version: -41
    /** Message to encrypt */
    content: string
    /** Your private key */
    privateKeyECDH: CryptoKey
    /** Your RSA key pair, used to encrypt the random AES key to decrypt the post by yourself */
    ownersRSAKeyPair: CryptoKeyPair
    /** Other's public keys. For everyone, will use 1 to 1 encryption to encrypt the random aes key */
    othersPublicKeyECDH: { key: CryptoKey; name: string }[]
    /** iv */
    iv: Uint8Array
}): Promise<{
    version: -41
    encryptedText: string
    iv: string
    /** Your encrypted post aes key. Should be attached in the post. */
    ownersAESKeyEncrypted: string
    /** All encrypted post aes key. Should be post on the gun. */
    othersAESKeyEncrypted: { key: PromiseReturnType<typeof encrypt1To1>; name: string }[]
}> {
    const { version, content, othersPublicKeyECDH, privateKeyECDH, ownersRSAKeyPair, iv } = info
    const AESKey = await crypto.subtle.generateKey({ name: 'AES-CBC', length: 256 }, true, ['encrypt', 'decrypt'])
    const encryptedText = await crypto.subtle.encrypt({ name: 'AES-CBC', iv: iv }, AESKey, encodeText(content))

    const exportedAESKey = encodeText(JSON.stringify(await crypto.subtle.exportKey('jwk', AESKey)))
    const ownersAESKeyEncrypted = await crypto.subtle.encrypt(
        { name: 'RSA-OAEP' },
        ownersRSAKeyPair.publicKey,
        exportedAESKey,
    )
    const othersAESKeyEncrypted = await Promise.all(
        othersPublicKeyECDH.map<
            Promise<{
                key: PromiseReturnType<typeof encrypt1To1>
                name: string
            }>
        >(async ({ key, name }) => {
            return {
                name,
                key: await encrypt1To1({
                    version: -41,
                    content: exportedAESKey,
                    othersPublicKeyECDH: key,
                    privateKeyECDH: privateKeyECDH,
                }),
            }
        }),
    )

    return {
        encryptedText: encodeArrayBuffer(encryptedText),
        iv: encodeArrayBuffer(iv),
        version: -41,
        ownersAESKeyEncrypted: encodeArrayBuffer(ownersAESKeyEncrypted),
        othersAESKeyEncrypted: othersAESKeyEncrypted,
    }
}
//#endregion
//#region decrypt text
/**
 * Decrypt 1 to 1
 */
export async function decryptMessage1To1(info: {
    version: -41
    encryptedText: string
    salt: string
    /** Your private key */
    privateKeyECDH: CryptoKey
    /** If you are the author, this should be the receiver's public key.
     * Otherwise, this should be the author's public key */
    anotherPublicKeyECDH: CryptoKey
}): Promise<string> {
    const { anotherPublicKeyECDH, version, salt, encryptedText, privateKeyECDH } = info

    const _encryptedText = decodeArrayBuffer(encryptedText)
    const _salt = decodeArrayBuffer(salt)

    const { iv, key: AESKey } = await deriveAESKey(privateKeyECDH, anotherPublicKeyECDH, new Uint8Array(_salt))
    const decryptText = await crypto.subtle.decrypt({ name: 'AES-CBC', iv: iv.buffer }, AESKey, _encryptedText)
    const originalText = decodeText(decryptText)
    return originalText
}
/**
 * Decrypt 1 to N message that send by other
 */
export async function decryptMessage1ToNByOther(info: {
    version: -41
    encryptedText: string
    privateKeyECDH: CryptoKey
    authorsPublickKeyECDH: CryptoKey
    AESKeyEncrypted: PromiseReturnType<typeof encrypt1To1>
}): Promise<string> {
    const { AESKeyEncrypted, version, encryptedText, privateKeyECDH, authorsPublickKeyECDH } = info

    const aesKeyJWK = decodeArrayBuffer(
        await decryptMessage1To1({
            version: -41,
            salt: AESKeyEncrypted.salt,
            encryptedText: AESKeyEncrypted.encryptedText,
            anotherPublicKeyECDH: authorsPublickKeyECDH,
            privateKeyECDH: privateKeyECDH,
        }),
    )
    const aesKey = await crypto.subtle.importKey(
        'jwk',
        JSON.parse(decodeText(aesKeyJWK)),
        { name: 'AES-CBC', length: 256 },
        false,
        ['decrypt'],
    )
    return decryptAESEncryptedText({ encryptedText, version: -41, aesKey })
}
/**
 * Decrypt 1 to N message that send by myself
 */
export async function decryptMessage1ToNByMyself(info: {
    version: -41
    encryptedText: string
    /** This should be included in the message */
    encryptedAESKey: string
    myRSAKeyPair: CryptoKeyPair
}): Promise<string> {
    const { encryptedAESKey, encryptedText, myRSAKeyPair, version } = info

    const aesKeyJWK = JSON.parse(
        decodeText(
            await crypto.subtle.decrypt(
                { name: 'RSA-OAEP' },
                myRSAKeyPair.privateKey,
                decodeArrayBuffer(encryptedAESKey),
            ),
        ),
    )
    const aesKey = await crypto.subtle.importKey('jwk', aesKeyJWK, { name: 'AES-CBC', length: 256 }, false, ['decrypt'])
    return decryptAESEncryptedText({ version: -41, encryptedText, aesKey })
}
/**
 * Decrypt the content encrypted by AES
 */
export async function decryptAESEncryptedText(info: {
    encryptedText: string
    aesKey: CryptoKey
    version: -41
}): Promise<string> {
    return decodeText(
        await crypto.subtle.decrypt({ name: 'AES-CBC' }, info.aesKey, decodeArrayBuffer(info.encryptedText)),
    )
}
//#endregion
//#region Sign & verify
export async function sign(message: string | ArrayBuffer, privateKey: CryptoKey): Promise<string> {
    const ecdsakey = privateKey.usages.indexOf('sign') !== -1 ? privateKey : await toECDSA(privateKey)
    if (typeof message === 'string') message = encodeText(message)
    return encodeArrayBuffer(await crypto.subtle.sign({ name: 'ECDSA', hash: { name: 'SHA-256' } }, ecdsakey, message))
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
