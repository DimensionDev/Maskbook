import { generateOthersAESKeyEncryptedV40, encrypt1ToN as encrypt1ToN40 } from './crypto-alpha-40'
export type PublishedAESKey = { encryptedKey: string; salt: string }
export type PublishedAESKeyRecordV39 = {
    aesKey: PublishedAESKey
    receiverKey: CryptoKey
}
export async function generateOthersAESKeyEncryptedV39(
    version: -39,
    AESKey: CryptoKey,
    privateKeyECDH: CryptoKey,
    othersPublicKeyECDH: CryptoKey[],
): Promise<PublishedAESKeyRecordV39[]> {
    const othersPublicKeyECDH_ = othersPublicKeyECDH.map((x, index) => ({ key: x, name: index.toString() }))
    const othersAESKeyEncrypted = await generateOthersAESKeyEncryptedV40(
        -40,
        AESKey,
        privateKeyECDH,
        othersPublicKeyECDH_,
    )
    const othersAESKeyEncrypted_ = othersAESKeyEncrypted.map<PublishedAESKeyRecordV39>(key => ({
        aesKey: key.key,
        receiverKey: othersPublicKeyECDH[parseInt(key.name, 10)],
    }))
    return othersAESKeyEncrypted_
}
/**
 * Encrypt 1 to N
 *
 * This function is generally based on encrypt1ToN in crypto-alpha-40
 */
export async function encrypt1ToN(info: {
    version: -39
    /** Message to encrypt */
    content: string | ArrayBuffer
    /** Your private key */
    privateKeyECDH: CryptoKey
    /** Your local AES key, used to encrypt the random AES key to decrypt the post by yourself */
    ownersLocalKey: CryptoKey
    /** Other's public keys. For everyone, will use 1 to 1 encryption to encrypt the random aes key */
    othersPublicKeyECDH: CryptoKey[]
    /** iv */
    iv: ArrayBuffer
}): Promise<{
    version: -39
    encryptedContent: ArrayBuffer
    iv: ArrayBuffer
    /** Your encrypted post aes key. Should be attached in the post. */
    ownersAESKeyEncrypted: ArrayBuffer
    /** All encrypted post aes key. Should be post on the gun. */
    othersAESKeyEncrypted: PublishedAESKeyRecordV39[]
}> {
    const othersPublicKeyECDH = info.othersPublicKeyECDH.map((x, index) => ({ key: x, name: index.toString() }))
    const { encryptedContent, iv, othersAESKeyEncrypted, ownersAESKeyEncrypted } = await encrypt1ToN40({
        ...info,
        othersPublicKeyECDH,
        version: -40,
    })
    const othersAESKeyEncrypted_ = othersAESKeyEncrypted.map(key => ({
        aesKey: key.key,
        receiverKey: othersPublicKeyECDH[parseInt(key.name, 10)].key,
    }))
    return { encryptedContent, iv, version: -39, ownersAESKeyEncrypted, othersAESKeyEncrypted: othersAESKeyEncrypted_ }
}

export { encrypt1To1, decryptMessage1To1 } from './crypto-alpha-40'
export { decryptMessage1ToNByOther, decryptMessage1ToNByMyself, extractAESKeyInMessage } from './crypto-alpha-40'
export { encryptWithAES, decryptWithAES } from './crypto-alpha-40'
export { sign, verify } from './crypto-alpha-40'
export { encryptComment, decryptComment } from './crypto-alpha-40'
