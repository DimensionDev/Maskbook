import { ec as EC } from 'elliptic'
import { EthereumAddress } from 'wallet.ts'
import type {
    EC_Public_JsonWebKey,
    EC_Private_JsonWebKey,
    EC_JsonWebKey,
} from '../../modules/CryptoAlgorithm/interfaces/utils'
import { Convert } from 'pvtsutils'

export function keyToJWK(key: string, type: 'public'): EC_Public_JsonWebKey
export function keyToJWK(key: string, type: 'private'): EC_Private_JsonWebKey
export function keyToJWK(key: string, type: 'public' | 'private'): JsonWebKey {
    const ec = new EC('secp256k1')
    const key_ = key.replace(/^0x/, '')
    const keyPair = type === 'public' ? ec.keyFromPublic(key_) : ec.keyFromPrivate(key_)
    const pubKey = keyPair.getPublic()
    const privKey = keyPair.getPrivate()
    return {
        crv: 'K-256',
        ext: true,
        x: base64(pubKey.getX().toArray()),
        y: base64(pubKey.getY().toArray()),
        key_ops: ['deriveKey', 'deriveBits'],
        kty: 'EC',
        d: type === 'private' ? base64(privKey.toArray()) : undefined,
    }
    function base64(nums: number[]) {
        return Convert.ToBase64Url(new Uint8Array(nums).buffer)
    }
}

export function JWKToKey(jwk: EC_JsonWebKey, type: 'public' | 'private'): string {
    return ''
}

export function keyToAddr(key: string, type: 'public' | 'private'): string {
    const ec = new EC('secp256k1')
    const key_ = key.replace(/^0x/, '')
    const keyPair = type === 'public' ? ec.keyFromPublic(key_) : ec.keyFromPrivate(key_)
    return EthereumAddress.from(keyPair.getPublic(false, 'array') as any).address
}
