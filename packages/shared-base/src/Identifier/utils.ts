import { type Option, Some, None } from 'ts-results'
import { ProfileIdentifier } from './profile'
import { PostIdentifier } from './post'
import { ECKeyIdentifier } from './ec-key'
import { PostIVIdentifier } from './post-iv'
import { Identifier } from './base'

/**
 * This type only refers to the stringified Identifier. ANY suffix CANNOT be renamed.
 * person:...
 * post:...
 * post_iv:...
 * ec_key:...
 *
 * Note:
 * group: has removed, if you want to add a new identifier for grouping, please choose another prefix.
 * @internal
 */
function parse(str: string | null | undefined): Option<Identifier> {
    if (!str) return None
    str = String(str)
    if (str.startsWith('person:')) {
        const [network, userID] = str.slice('person:'.length).split('/')
        if (!network || !userID) return None
        return ProfileIdentifier.of(network, userID)
    } else if (str.startsWith('post:')) {
        const [postID, ...rest] = str.slice('post:'.length).split('/')
        const inner = parse(rest.join('/'))
        if (inner.none) return None
        if (inner.val instanceof ProfileIdentifier) return Some(new PostIdentifier(inner.val, postID))
        return None
    } else if (str.startsWith('post_iv:')) {
        const [network, postIV] = str.slice('post_iv:'.length).split('/')
        if (!network || !postIV) return None
        return Some(new PostIVIdentifier(network, postIV.replace(/\|/g, '/')))
    } else if (str.startsWith('ec_key:')) {
        const [curve, compressedPoint] = str.slice('ec_key:'.length).split('/')
        if (curve !== 'secp256k1') return None
        if (!compressedPoint) return None
        return Some(new ECKeyIdentifier(curve, compressedPoint))
    }
    return None
}

function hasInstance(x: unknown): boolean {
    if (
        x instanceof ProfileIdentifier ||
        x instanceof ECKeyIdentifier ||
        x instanceof PostIVIdentifier ||
        x instanceof PostIdentifier
    )
        return true
    return false
}
// Due to circular reference, I have to move part of this class to this file.
Identifier[Symbol.hasInstance] = hasInstance
Identifier.from = parse
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
