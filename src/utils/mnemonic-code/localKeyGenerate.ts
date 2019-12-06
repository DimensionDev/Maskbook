import { CryptoKeyToJsonWebKey } from '../type-transform/CryptoKey-JsonWebKey'
import { import_PBKDF2_Key, derive_AES_GCM_256_Key_From_PBKDF2 } from '../crypto.subtle'
import { encodeText } from '../type-transform/String-ArrayBuffer'

/**
 * Local key (AES key) is used to encrypt message to myself.
 * This key should never be published.
 */

export async function deriveLocalKeyFromECDHKey(key: CryptoKey, mnemonicWord: string): Promise<CryptoKey> {
    const pub = await CryptoKeyToJsonWebKey(key)

    // ? Derive method: publicKey as "password" and password for the mnemonicWord as hash
    const pbkdf2 = await import_PBKDF2_Key(encodeText(pub.x! + pub.y!))
    return derive_AES_GCM_256_Key_From_PBKDF2(pbkdf2, encodeText(mnemonicWord))
}
