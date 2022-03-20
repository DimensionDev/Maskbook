import { encodeText } from '@dimensiondev/kit'
import type { EC_Public_JsonWebKey, AESJsonWebKey, AESCryptoKey } from '@masknet/shared-base'
import { CryptoKeyToJsonWebKey } from '../../../utils-pure'

/**
 * Local key (AES key) is used to encrypt message to myself.
 * This key should never be published.
 */

export async function deriveLocalKeyFromECDHKey(
    pub: EC_Public_JsonWebKey,
    mnemonicWord: string,
): Promise<AESJsonWebKey> {
    // ? Derive method: publicKey as "password" and password for the mnemonicWord as hash
    const pbkdf2 = await crypto.subtle.importKey('raw', encodeText(pub.x! + pub.y!), 'PBKDF2', false, [
        'deriveBits',
        'deriveKey',
    ])
    const aes = await crypto.subtle.deriveKey(
        { name: 'PBKDF2', salt: encodeText(mnemonicWord), iterations: 100000, hash: 'SHA-256' },
        pbkdf2,
        { name: 'AES-GCM', length: 256 },
        true,
        ['encrypt', 'decrypt'],
    )
    return CryptoKeyToJsonWebKey(aes as AESCryptoKey)
}
