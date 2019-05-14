import { FriendshipCertificateV1, FriendshipCertificateSignedV1 } from './friendship-cert'
import { encryptWithAES } from '../../crypto/crypto-alpha-40'
import { encodeArrayBuffer } from '../../utils/type-transform/EncodeDecode'
/**
 * Sign steps for {@link FriendshipCertificateV1}
 * @remakrs
 * Sign Steps:
 * 1. let `cert` = New {@link FriendshipCertificateV1}
 * 2. let `key` = A new random CryptoKey. algorithm = 'ECDH', curve: 'K-256'
 * 3. Derive an AES key by key of `cert target` and `key`, let it be `aes`
 * 4. Encrypt `cert` with `aes`, let it be `payload`, store the `iv`
 * 5. let `signed` = @{link FriendshipCertificateSignedV1} (version: `1`, payload: `payload`, cryptoKey: `key`, iv: `iv`)
 * 6. Send `signed` to server
 */
export async function signFriendshipCertificate(
    cert: FriendshipCertificateV1,
    targetKey: CryptoKey,
): Promise<FriendshipCertificateSignedV1> {
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
