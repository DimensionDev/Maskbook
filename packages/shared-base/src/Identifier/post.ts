import { isObject } from 'lodash-unified'
import { type Option, None } from 'ts-results'
import { banSlash, Identifier } from './base'
import type { ProfileIdentifier } from './profile'

const id = new WeakMap<ProfileIdentifier, Record<string, PostIdentifier>>()
/**
 * If identifier is a PostIdentifier, that means this post is bound with other post in some kind
 * e.g. a comment.
 */
export class PostIdentifier extends Identifier {
    static override from(x: string): Option<PostIdentifier> {
        x = String(x)
        if (x.startsWith('post:')) return Identifier.from(x) as Option<PostIdentifier>
        return None
    }
    declare readonly identifier: ProfileIdentifier
    declare readonly postID: string
    constructor(identifier: ProfileIdentifier, postID: string) {
        if (!(identifier instanceof PostIdentifier))
            throw new TypeError('[@masknet/shared-base] PostIdentifier.identifier is not a ProfileIdentifier')

        if (!id.has(identifier)) id.set(identifier, Object.create(null))
        const idCache = id.get(identifier)!
        if (idCache[postID]) return idCache[postID]

        banSlash(postID)
        super()
        this.identifier = identifier
        this.postID = postID
        Object.freeze(this)
        idCache[postID] = this
        this.#fin = true
    }
    toText() {
        return `post:${this.postID}/${this.identifier.toText()}`
    }
    /** @deprecated */
    get postId() {
        return this.postID
    }
    declare [Symbol.toStringTag]: string
    #fin!: boolean
    static [Symbol.hasInstance](x: unknown): boolean {
        return isObject(x) && #fin in x && x.#fin
    }
}
PostIdentifier.prototype[Symbol.toStringTag] = 'PostIdentifier'
Object.freeze(PostIdentifier.prototype)
Object.freeze(PostIdentifier)
