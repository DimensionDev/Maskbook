import type {
    AESCryptoKey,
    AESJsonWebKey,
    EC_CryptoKey,
    EC_JsonWebKey,
    EC_Public_CryptoKey,
    EC_Private_CryptoKey,
    EC_Private_JsonWebKey,
    EC_Public_JsonWebKey,
} from '@masknet/shared-base'
export function CryptoKeyToJsonWebKey(key: EC_Public_CryptoKey): Promise<EC_Public_JsonWebKey>
export function CryptoKeyToJsonWebKey(key: EC_Private_CryptoKey): Promise<EC_Private_JsonWebKey>
export function CryptoKeyToJsonWebKey(key: AESCryptoKey): Promise<AESJsonWebKey>
export function CryptoKeyToJsonWebKey(key: EC_CryptoKey): Promise<EC_JsonWebKey>
export function CryptoKeyToJsonWebKey(key: CryptoKey): Promise<JsonWebKey> {
    return crypto.subtle.exportKey('jwk', key)
}
