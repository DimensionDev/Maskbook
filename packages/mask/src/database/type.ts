import { ECKeyIdentifier } from '@masknet/shared-base'
import type { EC_JsonWebKey } from '../modules/CryptoAlgorithm/interfaces/utils'
import { CryptoKeyToJsonWebKey } from '../utils/type-transform/CryptoKey-JsonWebKey'
import { compressSecp256k1Key } from '../utils/type-transform/SECP256k1-Compression'

export {
    ECKeyIdentifier,
    GroupIdentifier,
    Identifier,
    PersonaIdentifier,
    PostIVIdentifier,
    PostIdentifier,
    ProfileIdentifier,
} from '@masknet/shared-base'
export function ECKeyIdentifierFromJsonWebKey(key: EC_JsonWebKey, type: 'public' | 'private' = 'public') {
    const x = compressSecp256k1Key(key, type)
    return new ECKeyIdentifier('secp256k1', x)
}
/**
 * @deprecated We're using JWK instead of CryptoKey
 */
export async function ECKeyIdentifierFromCryptoKey(key: CryptoKey) {
    return ECKeyIdentifierFromJsonWebKey(await CryptoKeyToJsonWebKey(key))
}
