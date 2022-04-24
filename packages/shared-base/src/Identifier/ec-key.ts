import { decodeArrayBuffer } from '@dimensiondev/kit'
import { Convert } from 'pvtsutils'
import { type Option, None } from 'ts-results'
import { isObject } from 'lodash-unified'
import { Identifier } from './base'

const k256Cache: Record<string, ECKeyIdentifier> = Object.create(null)
const keyAsHex: Record<string, string> = Object.create(null)

/**
 * This class identify the point on an EC curve.
 * ec_key:secp256k1/CompressedPoint
 */
export class ECKeyIdentifier extends Identifier {
    static override from(x: string): Option<ECKeyIdentifier> {
        x = String(x)
        if (x.startsWith('ec_key:')) return Identifier.from(x) as Option<ECKeyIdentifier>
        return None
    }

    // ! TODO: handle compressedPoint and encodedCompressedKey
    // private declare readonly encodedCompressedKey?: string
    // ! "curve" and "compressedPoint" cannot be renamed because they're stored in the database in it's object form.
    declare readonly curve: 'secp256k1'
    declare readonly publicKey: string
    declare readonly type: 'ec_key'
    constructor(curve: 'secp256k1', publicKey: string) {
        publicKey = String(publicKey)
        if (curve !== 'secp256k1') throw new Error('Only secp256k1 is supported')

        if (k256Cache[publicKey]) return k256Cache[publicKey]

        super()
        this.type = 'ec_key'
        this.curve = 'secp256k1'
        this.publicKey = publicKey
        Object.freeze(this)
        k256Cache[publicKey] = this
        this.#fin = true
    }
    toText() {
        const normalized = this.publicKey.replace(/\//g, '|')
        return `ec_key:${this.curve}/${normalized}`
    }
    /** @deprecated */
    get compressedPoint() {
        return this.publicKey
    }
    get publicKeyAsHex() {
        return '0x' + (keyAsHex[this.publicKey] ??= Convert.ToHex(decodeArrayBuffer(this.publicKey)))
    }
    declare [Symbol.toStringTag]: string
    #fin!: boolean
    static [Symbol.hasInstance](x: unknown): boolean {
        return isObject(x) && #fin in x && x.#fin
    }
}
ECKeyIdentifier.prototype[Symbol.toStringTag] = 'ECKeyIdentifier'
Object.freeze(ECKeyIdentifier.prototype)
Object.freeze(ECKeyIdentifier)

export type PersonaIdentifier = ECKeyIdentifier
// eslint-disable-next-line no-redeclare
export const PersonaIdentifier = [ECKeyIdentifier]
