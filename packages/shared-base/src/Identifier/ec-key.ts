import { decodeArrayBuffer, encodeArrayBuffer } from '@dimensiondev/kit'
import { Convert } from 'pvtsutils'
import { type Option, None, Some } from 'ts-results'
import { Identifier } from './base'

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
        const publicKey = encodeArrayBuffer(Convert.FromHex(hex))
        return Some(new ECKeyIdentifier('secp256k1', publicKey))
    }

    // ! TODO: handle compressedPoint and encodedCompressedKey
    // private declare readonly encodedCompressedKey?: string
    // ! "curve" and "compressedPoint" cannot be renamed because they're stored in the database in it's object form.
    declare readonly curve: 'secp256k1'
    declare readonly rawPublicKey: string
    constructor(curve: 'secp256k1', publicKey: string) {
        publicKey = String(publicKey).replace(/\|/g, '/')
        if (curve !== 'secp256k1') throw new Error('Only secp256k1 is supported')

        if (k256Cache[publicKey]) return k256Cache[publicKey]

        super()
        this.curve = 'secp256k1'
        this.rawPublicKey = publicKey
        Object.freeze(this)
        k256Cache[publicKey] = this
        instance.add(this)
    }
    toText() {
        const normalized = this.rawPublicKey.replace(/\//g, '|')
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
// eslint-disable-next-line no-redeclare
export const PersonaIdentifier = [ECKeyIdentifier]
