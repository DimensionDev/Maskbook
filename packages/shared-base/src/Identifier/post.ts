import { type Option, None } from 'ts-results'
import { Identifier } from './base'
import { ProfileIdentifier } from './profile'
import { banSlash } from './utils'

const instance = new WeakSet()
const id = new WeakMap<ProfileIdentifier, Record<string, PostIdentifier>>()
/**
 * If identifier is a PostIdentifier, that means this post is bound with other post in some kind
 * e.g. a comment.
 */
export class PostIdentifier extends Identifier {
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

        if (!id.has(identifier)) id.set(identifier, Object.create(null))
        const idCache = id.get(identifier)!
        if (idCache[postID]) return idCache[postID]

        banSlash(postID)
        super()
        this.identifier = identifier
        this.postID = postID
        Object.freeze(this)
        idCache[postID] = this
        instance.add(this)
    }
    toText() {
        return `post:${this.postID}/${this.identifier.toText()}`
    }
    /** @deprecated */
    get postId() {
        return this.postID
    }
    declare [Symbol.toStringTag]: string
    static [Symbol.hasInstance](x: any): boolean {
        return instance.has(x)
    }
}
PostIdentifier.prototype[Symbol.toStringTag] = 'PostIdentifier'
Object.freeze(PostIdentifier.prototype)
Object.freeze(PostIdentifier)
