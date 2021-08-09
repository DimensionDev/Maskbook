/**
 * @deprecated This version of payload is not in use.
 * Please goto Crypto alpha v38
 */
import {
    generateOthersAESKeyEncrypted as generateOthersAESKeyEncryptedV40,
    encrypt1ToN as encrypt1ToN40,
} from './crypto-alpha-40'
import type {
    AESJsonWebKey,
    EC_Private_JsonWebKey,
    EC_Public_JsonWebKey,
} from '../modules/CryptoAlgorithm/interfaces/utils'
export type PublishedAESKey = { encryptedKey: string; salt: string }
export type PublishedAESKeyRecordV39OrV38 = {
    aesKey: PublishedAESKey
    receiverKey: EC_Public_JsonWebKey
}
export async function generateOthersAESKeyEncrypted(
    version: -39 | -38,
    AESKey: AESJsonWebKey,
    privateKeyECDH: EC_Private_JsonWebKey,
    othersPublicKeyECDH: EC_Public_JsonWebKey[],
): Promise<PublishedAESKeyRecordV39OrV38[]> {
    const othersPublicKeyECDH_ = othersPublicKeyECDH.map((x, index) => ({ key: x, name: index.toString() }))
    const othersAESKeyEncrypted = await generateOthersAESKeyEncryptedV40(
        -40,
        AESKey,
        privateKeyECDH,
        othersPublicKeyECDH_,
    )
    const othersAESKeyEncrypted_ = othersAESKeyEncrypted.map<PublishedAESKeyRecordV39OrV38>((key) => ({
        aesKey: key.key,
        receiverKey: othersPublicKeyECDH[Number.parseInt(key.name, 10)],
    }))
    return othersAESKeyEncrypted_
}
/**
 * Encrypt 1 to N
 *
 * This function is generally based on encrypt1ToN in crypto-alpha-40
 */
export async function encrypt1ToN(info: {
    version: -38
    /** Message to encrypt */
    content: string | ArrayBuffer
    /** Your private key */
    privateKeyECDH: EC_Private_JsonWebKey
    /** Your local AES key, used to encrypt the random AES key to decrypt the post by yourself */
    ownersLocalKey: AESJsonWebKey
    /** Other's public keys. For everyone, will use 1 to 1 encryption to encrypt the random aes key */
    othersPublicKeyECDH: EC_Public_JsonWebKey[]
    /** iv */
    iv: ArrayBuffer
}): Promise<{
    version: -38
    encryptedContent: ArrayBuffer
    iv: ArrayBuffer
    /** Your encrypted post aes key. Should be attached in the post. */
    ownersAESKeyEncrypted: ArrayBuffer
    /** All encrypted post aes key. Should be post on the gun. */
    othersAESKeyEncrypted: PublishedAESKeyRecordV39OrV38[]
    /** The raw post AESKey. Be aware to protect it! */
    postAESKey: AESJsonWebKey
}> {
    const othersPublicKeyECDH = info.othersPublicKeyECDH.map((x, index) => ({ key: x, name: index.toString() }))
    const { encryptedContent, iv, othersAESKeyEncrypted, ownersAESKeyEncrypted, postAESKey } = await encrypt1ToN40({
        ...info,
        othersPublicKeyECDH,
        version: -40,
    })
    const othersAESKeyEncrypted_ = othersAESKeyEncrypted.map((key) => ({
        aesKey: key.key,
        receiverKey: othersPublicKeyECDH[Number.parseInt(key.name, 10)].key,
    }))
    return {
        encryptedContent,
        iv,
        version: info.version,
        ownersAESKeyEncrypted,
        othersAESKeyEncrypted: othersAESKeyEncrypted_,
        postAESKey,
    }
}

export { encrypt1To1, decryptMessage1To1 } from './crypto-alpha-40'
export { decryptMessage1ToNByOther, decryptMessage1ToNByMyself, extractAESKeyInMessage } from './crypto-alpha-40'
export { encryptWithAES, decryptWithAES } from './crypto-alpha-40'
export { encryptComment, decryptComment } from './crypto-alpha-40'
export { typedMessageStringify, typedMessageParse } from './crypto-alpha-40'
