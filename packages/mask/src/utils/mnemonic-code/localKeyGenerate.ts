import { encodeText } from '@dimensiondev/kit'
import { CryptoWorker } from '../../modules/workers'
import type { EC_Public_JsonWebKey, AESJsonWebKey } from '@masknet/shared-base'
import { derive_AES_GCM_256_Key_From_PBKDF2 } from '../../modules/CryptoAlgorithm/helper'

/**
 * Local key (AES key) is used to encrypt message to myself.
 * This key should never be published.
 */

export async function deriveLocalKeyFromECDHKey(
    pub: EC_Public_JsonWebKey,
    mnemonicWord: string,
): Promise<AESJsonWebKey> {
    // ? Derive method: publicKey as "password" and password for the mnemonicWord as hash
    const pbkdf2 = await CryptoWorker.import_pbkdf2(encodeText(pub.x! + pub.y!))
    return derive_AES_GCM_256_Key_From_PBKDF2(pbkdf2, encodeText(mnemonicWord))
}
