import { ECKeyIdentifier, type EC_JsonWebKey } from '@masknet/shared-base'
import { CryptoKeyToJsonWebKey } from '../utils/type-transform/CryptoKey-JsonWebKey'
import { compressSecp256k1Key } from '../utils/type-transform/SECP256k1-Compression'

export function ECKeyIdentifierFromJsonWebKey(key: EC_JsonWebKey) {
    const x = compressSecp256k1Key(key)
    return new ECKeyIdentifier('secp256k1', x)
}
export async function ECKeyIdentifierFromCryptoKey(key: CryptoKey) {
    return ECKeyIdentifierFromJsonWebKey(await CryptoKeyToJsonWebKey(key))
}
