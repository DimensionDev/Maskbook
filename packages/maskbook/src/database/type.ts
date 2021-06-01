import { ECKeyIdentifier, compressSecp256k1Key } from '@dimensiondev/maskbook-shared'
import type { EC_JsonWebKey } from '../modules/CryptoAlgorithm/interfaces/utils'
import { CryptoKeyToJsonWebKey } from '../utils/type-transform/CryptoKey-JsonWebKey'

export {
    ECKeyIdentifier,
    GroupIdentifier,
    Identifier,
    PersonaIdentifier,
    PostIVIdentifier,
    PostIdentifier,
    PreDefinedVirtualGroupNames,
    ProfileIdentifier,
} from '@dimensiondev/maskbook-shared'
export function ECKeyIdentifierFromJsonWebKey(key: EC_JsonWebKey) {
    const x = compressSecp256k1Key(key, 'public')
    return new ECKeyIdentifier('secp256k1', x)
}
/**
 * @deprecated We're using JWK instead of CryptoKey
 */
export async function ECKeyIdentifierFromCryptoKey(key: CryptoKey) {
    return ECKeyIdentifierFromJsonWebKey(await CryptoKeyToJsonWebKey(key))
}
