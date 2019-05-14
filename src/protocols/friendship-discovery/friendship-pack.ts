import { FriendshipCertificateV1, FriendshipCertificatePackedV1 } from './friendship-cert'
import { encryptWithAES, decryptWithAES } from '../../crypto/crypto-alpha-40'
import { encodeArrayBuffer, decodeText } from '../../utils/type-transform/EncodeDecode'
import { toECDH } from '../../utils/type-transform/CryptoUtils'
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
    cert: FriendshipCertificateV1,
    targetKey: CryptoKey,
): Promise<FriendshipCertificatePackedV1> {
    const key = await crypto.subtle.generateKey({ name: 'ECDH', namedCurve: 'K-256' }, true, ['deriveKey'])
    const aes = await crypto.subtle.deriveKey(
        { name: 'ECDH', public: targetKey },
        key.privateKey,
        { name: 'AES-GCM', length: 256 },
        false,
        ['encrypt', 'decrypt'],
    )
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
    packed: FriendshipCertificatePackedV1,
    privateKey: CryptoKey,
): Promise<null | FriendshipCertificateV1> {
    const ownPrivateKey = privateKey.usages.find(x => x === 'deriveKey') ? privateKey : await toECDH(privateKey)
    const packedCryptoKey = await crypto.subtle.importKey(
        'jwk',
        packed.cryptoKey,
        { name: 'ECDH', namedCurve: 'K-256' },
        false,
        ['deriveKey'],
    )
    const aes = await crypto.subtle.deriveKey(
        { name: 'ECDH', public: packedCryptoKey },
        ownPrivateKey,
        { name: 'AES-GCM', length: 256 },
        false,
        ['encrypt', 'decrypt'],
    )
    try {
        const certBuffer = await decryptWithAES({ aesKey: aes, encrypted: packed.payload, iv: packed.iv })
        const certString = decodeText(certBuffer)
        const cert: FriendshipCertificateV1 = JSON.parse(certString)
        if (!cert.myId || !cert.network) throw new TypeError('Not a valid cert.')
        return cert
    } catch {
        return null
    }
}
