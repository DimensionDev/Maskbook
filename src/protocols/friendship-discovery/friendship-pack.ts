import type { FriendshipCertificateDecryptedV1, FriendshipCertificateEncryptedV1 } from './friendship-cert'
import { encryptWithAES, decryptWithAES } from '../../crypto/crypto-alpha-40'
import { encodeArrayBuffer, decodeText } from '../../utils/type-transform/String-ArrayBuffer'
import { toECDH } from '../../utils/type-transform/ECDSA-ECDH'
import { ProfileIdentifier } from '../../database/type'
import {
    generate_ECDH_256k1_KeyPair,
    import_ECDH_256k1_Key,
    derive_AES_GCM_256_Key_From_ECDH_256k1_Keys,
} from '../../utils/crypto.subtle'

export async function issueFriendshipCertificate(
    whoAmI: ProfileIdentifier,
    channelKey: CryptoKey,
    channelSeed: string,
): Promise<FriendshipCertificateDecryptedV1> {
    return {
        certificateIssuer: whoAmI,
        channelCryptoKey: await crypto.subtle.exportKey('jwk', channelKey),
        channelSeed: channelSeed,
    }
}

/**
 * Pack steps for {@link FriendshipCertificateV1}
 * @remakrs
 * Pack Steps:
 * 1. let `cert` = New {@link FriendshipCertificateV1}
 * 2. let `key` = A new random CryptoKey. algorithm = 'ECDH', curve: 'K-256'
 * 3. Derive an AES key by key of `cert target` and `key`, let it be `aes`
 * 4. Encrypt `cert` with `aes`, let it be `payload`, store the `iv`
 * 5. let `packed` = @{link FriendshipCertificatePackedV1} (version: `1`, payload: `payload`, cryptoKey: `key`, iv: `iv`)
 * 6. Send `packed` to server
 */
export async function packFriendshipCertificate(
    cert: FriendshipCertificateDecryptedV1,
    targetKey: CryptoKey,
): Promise<FriendshipCertificateEncryptedV1> {
    const key = await generate_ECDH_256k1_KeyPair()
    const aes = await derive_AES_GCM_256_Key_From_ECDH_256k1_Keys(targetKey, key.privateKey)
    const { content: payload, iv } = await encryptWithAES({
        aesKey: aes,
        content: JSON.stringify(cert),
    })
    return {
        cryptoKey: await crypto.subtle.exportKey('jwk', key.publicKey),
        iv: encodeArrayBuffer(iv),
        payload: encodeArrayBuffer(payload),
        timestamp: Date.now(),
        version: 1,
    }
}
/**
 * Verify Steps:
 * For each `packed` ({@link FriendshipCertificatePackedV1}):
 *      1. Derive an AES key by `packed.cryptoKey` and your own key, let it be `aes`
 *      2. Decrypt `packed.payload`, if failed, drop it; else, let it be `cert`
 *      3. Manual or automatically verify friendship of `cert.myId` on network `cert.network`
 */
export async function unpackFriendshipCertificate(
    packed: FriendshipCertificateEncryptedV1,
    privateKey: CryptoKey,
): Promise<null | FriendshipCertificateDecryptedV1> {
    const ownPrivateKey = privateKey.usages.find((x) => x === 'deriveKey') ? privateKey : await toECDH(privateKey)
    const packedCryptoKey = await import_ECDH_256k1_Key(packed.cryptoKey)
    const aes = await derive_AES_GCM_256_Key_From_ECDH_256k1_Keys(packedCryptoKey, ownPrivateKey)
    try {
        const certBuffer = await decryptWithAES({ aesKey: aes, encrypted: packed.payload, iv: packed.iv })
        const certString = decodeText(certBuffer)
        const cert: FriendshipCertificateDecryptedV1 = JSON.parse(certString)
        if (!cert.certificateIssuer || !cert.channelCryptoKey || !cert.channelSeed)
            throw new TypeError('Not a valid cert.')
        // Recover prototype
        Object.setPrototypeOf(cert.certificateIssuer, ProfileIdentifier.prototype)
        return cert
    } catch {
        return null
    }
}
