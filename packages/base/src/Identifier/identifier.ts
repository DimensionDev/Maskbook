import { type Option, None, Some, Result, Err } from 'ts-results-es'
import { decodeArrayBuffer, encodeArrayBuffer } from '@masknet/kit'
import { Convert } from 'pvtsutils'
import { isEC_JsonWebKey, type EC_JsonWebKey, type EC_Public_JsonWebKey } from '../WebCrypto/JsonWebKey.js'
import { decompressK256Key, type EC_CryptoKey, type EC_Public_CryptoKey } from '../index.js'
import { compressK256Key } from '../WebCrypto/k256.js'

export abstract class Identifier {
    abstract toText(): string
    abstract [Symbol.toStringTag]: string
    /** @internal */
    toString() {
        return this.toText()
    }
    /**
     * This type only refers to the stringified Identifier. ANY suffix CANNOT be renamed.
     * person:...
     * post:...
     * post_iv:...
     * ec_key:...
     *
     * Note:
     * group: has removed, if you want to add a new identifier for grouping, please choose another prefix.
     */
    static from(input: string | undefined | null): Option<Identifier> {
        if (!input) return None
        input = String(input)
        if (input.startsWith('person:')) {
            const [network, userID] = input.slice('person:'.length).split('/')
            if (!network || !userID) return None
            return ProfileIdentifier.of(network, userID)
        } else if (input.startsWith('post:')) {
            const [postID, ...rest] = input.slice('post:'.length).split('/')
            const inner = Identifier.from(rest.join('/'))
            if (inner.isNone()) return None
            if (inner.value instanceof ProfileIdentifier) return Some(new PostIdentifier(inner.value, postID))
            return None
        } else if (input.startsWith('post_iv:')) {
            const [network, postIV] = input.slice('post_iv:'.length).split('/')
            if (!network || !postIV) return None
            return Some(new PostIVIdentifier(network, postIV.replaceAll('|', '/')))
        } else if (input.startsWith('ec_key:')) {
            const [curve, compressedPoint] = input.slice('ec_key:'.length).split('/')
            if (curve !== 'secp256k1') return None
            if (!compressedPoint) return None
            return Some(new ECKeyIdentifier(curve, compressedPoint))
        }
        return None
    }
    static [Symbol.hasInstance](x: unknown): boolean {
        return (
            x instanceof ProfileIdentifier ||
            x instanceof ECKeyIdentifier ||
            x instanceof PostIVIdentifier ||
            x instanceof PostIdentifier
        )
    }
    static {
        Object.freeze(Identifier.prototype)
        Object.freeze(Identifier)
    }
}

/**
 * This class identify the point on an EC curve.
 * ec_key:secp256k1/CompressedPoint
 */
export class ECKeyIdentifier extends Identifier {
    static #k256: Record<string, ECKeyIdentifier> = Object.create(null)
    static #keyAsHex: Record<string, string> = Object.create(null)
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
        if (ECKeyIdentifier.#k256[publicKey]) return ECKeyIdentifier.#k256[publicKey]

        super()
        this.curve = 'secp256k1'
        this.rawPublicKey = publicKey
        Object.freeze(this)
        ECKeyIdentifier.#k256[publicKey] = this
    }
    toText() {
        const normalized = this.rawPublicKey.replaceAll('/', '|')
        return `ec_key:${this.curve}/${normalized}`
    }
    get publicKeyAsHex() {
        return (
            '0x' +
            (ECKeyIdentifier.#keyAsHex[this.rawPublicKey] ??= Convert.ToHex(decodeArrayBuffer(this.rawPublicKey)))
        )
    }
    declare [Symbol.toStringTag]: string
    static override [Symbol.hasInstance](x: any): boolean {
        return toText(x)?.startsWith('ec_key:') ?? false
    }
    static {
        ECKeyIdentifier.prototype[Symbol.toStringTag] = 'ECKeyIdentifier'
        Object.freeze(ECKeyIdentifier.prototype)
        Object.freeze(ECKeyIdentifier)
    }
}
export type PersonaIdentifier = ECKeyIdentifier
export const PersonaIdentifier = [ECKeyIdentifier]

export class PostIVIdentifier extends Identifier {
    static #cache: Record<string, Record<string, PostIVIdentifier>> = Object.create(null)
    static override from(input: string | null | undefined): Option<PostIVIdentifier> {
        if (!input) return None
        input = String(input)
        if (input.startsWith('post_iv:')) return Identifier.from(input) as Option<PostIVIdentifier>
        return None
    }
    declare readonly network: string
    declare readonly postIV: string
    constructor(network: string, postIV: string) {
        network = String(network)
        postIV = String(postIV)

        const networkCache = (PostIVIdentifier.#cache[network] ??= {})
        // return the cache to keep the object identity
        // eslint-disable-next-line no-constructor-return
        if (networkCache[postIV]) return networkCache[postIV]

        banSlash(network, 'PostIVIdentifier.network')
        super()
        this.network = network
        this.postIV = postIV
        Object.freeze(this)
        networkCache[postIV] = this
    }
    toText() {
        return `post_iv:${this.network}/${this.postIV.replaceAll('/', '|')}`
    }
    toIV() {
        const x = this.postIV.replaceAll('|', '/')
        return new Uint8Array(decodeArrayBuffer(x))
    }
    declare [Symbol.toStringTag]: string
    static override [Symbol.hasInstance](x: any): boolean {
        return toText(x)?.startsWith('post_iv:') ?? false
    }
    static {
        PostIVIdentifier.prototype[Symbol.toStringTag] = 'PostIVIdentifier'
        Object.freeze(PostIVIdentifier.prototype)
        Object.freeze(PostIVIdentifier)
    }
}

/**
 * If identifier is a PostIdentifier, that means this post is bound with other post in some kind
 * e.g. a comment.
 */
export class PostIdentifier extends Identifier {
    static #cache = new WeakMap<ProfileIdentifier, Record<string, PostIdentifier>>()
    static override from(input: string | null | undefined): Option<PostIdentifier> {
        if (!input) return None
        input = String(input)
        if (input.startsWith('post:')) return Identifier.from(input) as Option<PostIdentifier>
        return None
    }
    declare readonly identifier: ProfileIdentifier
    declare readonly postID: string
    constructor(identifier: ProfileIdentifier, postID: string) {
        if (!(identifier instanceof ProfileIdentifier))
            throw new TypeError('[@masknet/shared-base] PostIdentifier.identifier is not a ProfileIdentifier')

        if (!PostIdentifier.#cache.has(identifier)) PostIdentifier.#cache.set(identifier, Object.create(null))
        const idCache = PostIdentifier.#cache.get(identifier)!
        // return the cache to keep the object identity
        // eslint-disable-next-line no-constructor-return
        if (idCache[postID]) return idCache[postID]

        banSlash(postID, 'PostIdentifier.postID')
        super()
        this.identifier = identifier
        this.postID = postID
        Object.freeze(this)
        idCache[postID] = this
    }
    toText() {
        return `post:${this.postID}/${this.identifier.toText()}`
    }
    /** @deprecated */
    get postId() {
        return this.postID
    }
    declare [Symbol.toStringTag]: string
    static override [Symbol.hasInstance](x: any): boolean {
        return toText(x)?.startsWith('post:') ?? false
    }
    static {
        PostIdentifier.prototype[Symbol.toStringTag] = 'PostIdentifier'
        Object.freeze(PostIdentifier.prototype)
        Object.freeze(PostIdentifier)
    }
}

/**
 * Refers to a profile on a network.
 */
export class ProfileIdentifier extends Identifier {
    static #cache: Record<string, Record<string, ProfileIdentifier>> = Object.create(null)
    static override from(input: string | null | undefined): Option<ProfileIdentifier> {
        input = String(input)
        if (input === 'person:localhost/$unknown') return None
        if (input.startsWith('person:')) return Identifier.from(input) as Option<ProfileIdentifier>
        return None
    }
    static of(network: string | undefined | null, userID: string | undefined | null): Option<ProfileIdentifier> {
        if (!userID || !network) return None
        if (network === 'localhost' && userID === '$unknown') return None
        if (network.includes('/') || userID.includes('/')) return None
        if (network.includes('\n') || userID.includes('\n')) return None
        return Some(new ProfileIdentifier(network, userID))
    }

    // ! "network" and "userId" cannot be renamed because they're stored in the database in it's object form.
    declare readonly network: string
    declare readonly userId: string
    private constructor(network: string, userID: string) {
        network = String(network).toLowerCase()
        userID = String(userID)

        if (network === 'localhost' && userID === '$unknown') {
            throw new TypeError('[@masknet/base] Use null instead.')
        }
        if (!userID) throw new TypeError('[@masknet/base] userID cannot be empty.')

        const networkCache = (ProfileIdentifier.#cache[network] ??= {})
        // return the cache to keep the object identity
        // eslint-disable-next-line no-constructor-return
        if (networkCache[userID]) return networkCache[userID]

        banSlash(network, 'ProfileIdentifier.network')
        banSlash(userID, 'ProfileIdentifier.userID')
        super()
        this.network = network
        this.userId = userID
        Object.freeze(this)
        networkCache[userID] = this
    }
    toText() {
        return `person:${this.network}/${this.userId}`
    }
    declare [Symbol.toStringTag]: string
    static override [Symbol.hasInstance](x: any): boolean {
        return toText(x)?.startsWith('person:') ?? false
    }
    static {
        ProfileIdentifier.prototype[Symbol.toStringTag] = 'ProfileIdentifier'
        Object.freeze(ProfileIdentifier.prototype)
        Object.freeze(ProfileIdentifier)
    }
}

/**
 * Because "/" is used to split parts in identifier
 * we should reject the "/"
 *
 * If you want to use it, you must first convert to something else
 * @internal
 */
function banSlash(input: string | undefined | null, source?: string) {
    if (!input) return
    if (input.includes('/')) throw new TypeError(`Cannot contain / in a part of identifier (${source}): ${input}`)
}

function toText(x: any) {
    try {
        const text = x.toText()
        if (typeof text === 'string') return text
        return
    } catch {
        return
    }
}
