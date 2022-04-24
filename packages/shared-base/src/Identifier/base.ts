import { type Option, Some, None, type Result, Err } from 'ts-results'
import { ProfileIdentifier } from './profile'
import { PostIdentifier } from './post'
import { ECKeyIdentifier } from './ec-key'
import { PostIVIdentifier } from './post-iv'
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
function parse(x: string): Option<Identifier> {
    if (x.startsWith('person:')) {
        const [network, userID] = x.slice('person:'.length).split('/')
        if (!network || !userID) return None
        const id = ProfileIdentifier.of(network, userID)
        if (id) return Some(id)
        return None
    } else if (x.startsWith('post:')) {
        const [postID, ...rest] = x.slice('post:'.length).split('/')
        const inner = parse(rest.join('/'))
        if (inner.none) return None
        if (inner.val instanceof ProfileIdentifier) return Some(new PostIdentifier(inner.val, postID))
        return None
    } else if (x.startsWith('post_iv:')) {
        const [network, postIV] = x.slice('post_iv:'.length).split('/')
        if (!network || !postIV) return None
        return Some(new PostIVIdentifier(network, postIV.replace(/\|/g, '/')))
    } else if (x.startsWith('ec_key:')) {
        const [curve, compressedPoint] = x.slice('ec_key:'.length).split('/')
        if (curve !== 'secp256k1') return None
        if (!compressedPoint) return None
        return Some(new ECKeyIdentifier(curve, compressedPoint))
    }
    return None
}
export abstract class Identifier {
    abstract toText(): string
    abstract [Symbol.toStringTag]: string
    /** @deprecated */
    static equals(x: Identifier, y: Identifier) {
        return x === y
    }
    /** @deprecated */
    equals(x: Identifier | undefined | null) {
        return x === this
    }
    /**
     * @deprecated Prefer toText().
     * If you forgot to pass it to the serializer, calling `.toText()` will cause a runtime error to help you debug.
     */
    toString() {
        return this.toText()
    }
    static from(x: string): Option<Identifier> {
        return parse(String(x))
    }
    /** @deprecated */
    static fromString(x: string, ctor: typeof ProfileIdentifier): Result<ProfileIdentifier, Error>
    static fromString(x: string, ctor: typeof PostIdentifier): Result<PostIdentifier, Error>
    static fromString(x: string, ctor: typeof ECKeyIdentifier): Result<ECKeyIdentifier, Error>
    static fromString(x: string, ctor: typeof PostIVIdentifier): Result<PostIVIdentifier, Error>
    static fromString(x: string): Result<Identifier, Error>
    static fromString(x: string, ctor?: Function): Result<Identifier, Error> {
        const result = this.from(x).toResult(new Error())
        if (!ctor) return result
        if (result.err) return result
        if (result.val instanceof ctor) return result
        return Err(new Error())
    }
    static [Symbol.hasInstance](x: unknown): boolean {
        if (
            x instanceof ProfileIdentifier ||
            x instanceof ECKeyIdentifier ||
            x instanceof PostIVIdentifier ||
            x instanceof PostIdentifier
        )
            return true
        return false
    }
}
Object.freeze(Identifier.prototype)
Object.freeze(Identifier)

/**
 * Because "/" is used to split parts in identifier
 * we should reject the "/"
 *
 * If you want to use it, you must first convert to something other
 * @internal
 */
export function banSlash(str: string | undefined | null) {
    if (!str) return
    if (str.includes('/')) throw new TypeError('Cannot contain / in a part of identifier')
}
