import { decodeArrayBuffer, encodeArrayBuffer } from '@masknet/kit'
import { Convert } from 'pvtsutils'
import { type Option, None, Some, Result, Err } from 'ts-results-es'
import { Identifier } from './base.js'
import { isEC_JsonWebKey, type EC_JsonWebKey, type EC_Public_JsonWebKey } from '../WebCrypto/JsonWebKey.js'
import { decompressK256Key, type EC_CryptoKey, type EC_Public_CryptoKey } from '../index.js'
import { compressK256Key } from '../WebCrypto/k256.js'

const instance = new WeakSet()
const k256Cache: Record<string, ECKeyIdentifier> = Object.create(null)
const keyAsHex: Record<string, string> = Object.create(null)

/**
 * This class identify the point on an EC curve.
 * ec_key:secp256k1/CompressedPoint
 */
export class ECKeyIdentifier extends Identifier {
    static override from(input: string | null | undefined): Option<ECKeyIdentifier> {
        if (!input) return None
        input = String(input)
        if (input.startsWith('ec_key:')) return Identifier.from(input) as Option<ECKeyIdentifier>
        return None
    }
    static fromHexPublicKeyK256(hex: string | null | undefined): Option<ECKeyIdentifier> {
        if (!hex) return None
        hex = String(hex)
        if (hex.startsWith('0x')) hex = hex.slice(2)
        const publicKey = encodeArrayBuffer(new Uint8Array(Convert.FromHex(hex)))
        return Some(new ECKeyIdentifier('secp256k1', publicKey))
    }
    static async fromJsonWebKey(key: EC_JsonWebKey): Promise<Result<ECKeyIdentifier, unknown>> {
        if (!isEC_JsonWebKey(key)) return Err(new Error('key is not a EC_JsonWebKey'))
        if (key.crv !== 'K-256') return Err(new Error('curve is not K-256'))
        const result = await Result.wrapAsync(() => compressK256Key(key))
        return result.map((key) => new ECKeyIdentifier('secp256k1', key))
    }
    static async fromCryptoKey(key: EC_CryptoKey): Promise<Result<ECKeyIdentifier, unknown>> {
        if (!key.extractable) return Err('key is not extractable')
        if ((key.algorithm as EcKeyAlgorithm).namedCurve !== 'K-256') return Err('curve is not K-256')
        const jwk = await Result.wrapAsync(() => crypto.subtle.exportKey('jwk', key))
        if (jwk.isErr()) return jwk
        return ECKeyIdentifier.fromJsonWebKey(jwk.value as EC_JsonWebKey)
    }
    async toJsonWebKey(usage: 'sign_and_verify' | 'derive'): Promise<EC_Public_JsonWebKey> {
        const key = await decompressK256Key(this.rawPublicKey)
        if (usage === 'sign_and_verify') key.key_ops = ['sign', 'verify']
        return key
    }
    async toCryptoKey(usage: 'sign_and_verify' | 'derive'): Promise<EC_Public_CryptoKey> {
        const key = await this.toJsonWebKey(usage)
        return crypto.subtle.importKey(
            'jwk',
            key as JsonWebKey,
            { name: usage === 'sign_and_verify' ? 'ECDSA' : 'ECDH', namedCurve: 'K-256' },
            true,
            key.key_ops as readonly KeyUsage[],
        ) as Promise<EC_Public_CryptoKey>
    }

    declare readonly curve: 'secp256k1'
    declare readonly rawPublicKey: string
    constructor(curve: 'secp256k1', publicKey: string) {
        publicKey = String(publicKey).replaceAll('|', '/')
        if (curve !== 'secp256k1') throw new Error('Only secp256k1 is supported')

        // return the cache to keep the object identity
        // eslint-disable-next-line no-constructor-return
        if (k256Cache[publicKey]) return k256Cache[publicKey]

        super()
        this.curve = 'secp256k1'
        this.rawPublicKey = publicKey
        Object.freeze(this)
        k256Cache[publicKey] = this
        instance.add(this)
    }
    toText() {
        const normalized = this.rawPublicKey.replaceAll('/', '|')
        return `ec_key:${this.curve}/${normalized}`
    }
    get publicKeyAsHex() {
        return '0x' + (keyAsHex[this.rawPublicKey] ??= Convert.ToHex(decodeArrayBuffer(this.rawPublicKey)))
    }
    declare [Symbol.toStringTag]: string
    static [Symbol.hasInstance](x: any): boolean {
        return instance.has(x)
    }
}
ECKeyIdentifier.prototype[Symbol.toStringTag] = 'ECKeyIdentifier'
Object.freeze(ECKeyIdentifier.prototype)
Object.freeze(ECKeyIdentifier)

export type PersonaIdentifier = ECKeyIdentifier
export const PersonaIdentifier = [ECKeyIdentifier]
