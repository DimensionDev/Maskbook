import { CryptoWorker } from '../workers'
import type { PBKDF2UnknownKey, EC_Public_JsonWebKey, EC_Private_JsonWebKey, JsonWebKeyPair } from './interfaces/utils'

export function derive_AES_GCM_256_Key_From_PBKDF2(
    pbkdf: PBKDF2UnknownKey,
    iv: ArrayBuffer,
    hash: 'SHA-256' = 'SHA-256',
    iterations = 100000,
) {
    return CryptoWorker.derive_aes_from_pbkdf2(pbkdf, iv, hash, 'AES-GCM', 256, iterations)
}

export function derive_AES_GCM_256_Key_From_ECDH_256k1_Keys(priv: EC_Private_JsonWebKey, pub: EC_Public_JsonWebKey) {
    return CryptoWorker.derive_aes_from_ecdh_k256(priv, pub, 'AES-GCM', 256)
}

export async function split_ec_k256_keypair_into_pub_priv(
    key: Readonly<JsonWebKey>,
): Promise<JsonWebKeyPair<EC_Public_JsonWebKey, EC_Private_JsonWebKey>> {
    const { d, ...pub } = key
    if (!d) throw new TypeError('split_ec_k256_keypair_into_pub_priv requires a private key (jwk.d)')
    // TODO: maybe should do some extra check on properties
    // @ts-expect-error Do a force transform
    return { privateKey: { ...key }, publicKey: pub }
}
