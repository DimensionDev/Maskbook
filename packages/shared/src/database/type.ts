import type { EC_JsonWebKey } from '..'
import { compressSecp256k1Key, ECKeyIdentifier } from '..'

export function ECKeyIdentifierFromJsonWebKey(key: EC_JsonWebKey) {
    const x = compressSecp256k1Key(key, 'public')
    return new ECKeyIdentifier('secp256k1', x)
}
