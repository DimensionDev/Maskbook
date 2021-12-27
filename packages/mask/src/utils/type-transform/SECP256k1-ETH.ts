import { ec as EC } from 'elliptic'
import { EthereumAddress } from 'wallet.ts'
import {
    toBase64URL,
    fromBase64URL,
    EC_Public_JsonWebKey,
    EC_Private_JsonWebKey,
    EC_JsonWebKey,
    isSecp256k1Point,
    isSecp256k1PrivateKey,
} from '@masknet/shared-base'
import { concatArrayBufferSync } from '@dimensiondev/kit'

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
        return toBase64URL(new Uint8Array(nums).buffer)
    }
}

export function JWKToKey(jwk: EC_JsonWebKey, type: 'public' | 'private'): string {
    const ec = new EC('secp256k1')
    if (type === 'public' && jwk.x && jwk.y) {
        const xb = fromBase64URL(jwk.x)
        const yb = fromBase64URL(jwk.y)
        const point = new Uint8Array(concatArrayBufferSync(new Uint8Array([0x04]), xb, yb))
        if (isSecp256k1Point(point)) return `0x${ec.keyFromPublic(point).getPublic(false, 'hex')}`
    }
    if (type === 'private' && jwk.d) {
        const db = fromBase64URL(jwk.d)
        if (isSecp256k1PrivateKey(db)) return `0x${ec.keyFromPrivate(db).getPrivate('hex')}`
    }
    throw new Error('invalid private key')
}

export function keyToAddr(key: string, type: 'public' | 'private'): string {
    const ec = new EC('secp256k1')
    const key_ = key.replace(/^0x/, '')
    const keyPair = type === 'public' ? ec.keyFromPublic(key_) : ec.keyFromPrivate(key_)
    return EthereumAddress.from(keyPair.getPublic(false, 'array') as any).address
}
