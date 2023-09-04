import { type Option, Some, None } from 'ts-results-es'
import { ProfileIdentifier } from './profile.js'
import { PostIdentifier } from './post.js'
import { ECKeyIdentifier } from './ec-key.js'
import { PostIVIdentifier } from './post-iv.js'
import { Identifier } from './base.js'

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
function parse(input: string | null | undefined): Option<Identifier> {
    if (!input) return None
    input = String(input)
    if (input.startsWith('person:')) {
        const [network, userID] = input.slice('person:'.length).split('/')
        if (!network || !userID) return None
        return ProfileIdentifier.of(network, userID)
    } else if (input.startsWith('post:')) {
        const [postID, ...rest] = input.slice('post:'.length).split('/')
        const inner = parse(rest.join('/'))
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
 * If you want to use it, you must first convert to something else
 * @internal
 */
export function banSlash(input: string | undefined | null, source?: string) {
    if (!input) return
    if (input.includes('/')) throw new TypeError(`Cannot contain / in a part of identifier (${source}): ${input}`)
}
