type Identifiers = 'person' | 'group' | 'post'
const fromString = Symbol()
function noSlash(str: string) {
    if (str.split('/')[1]) throw new TypeError('Cannot contain / in a part of identifier')
}
export abstract class Identifier {
    abstract toString(): string
    static fromString(id: string): Identifier | null {
        const [type, ...rest] = id.split(':') as [Identifiers, string]
        switch (type) {
            case 'person':
                return PersonIdentifier[fromString](rest.join(''))
            case 'group':
                return GroupIdentifier[fromString](rest.join(''))
            case 'post':
                return PostIdentifier[fromString](rest.join(''))
            default:
                return null
        }
    }
}
export class PersonIdentifier extends Identifier {
    /**
     * @param network - Network belongs to
     * @param userId - User ID
     */
    constructor(public network: string, public userId: string) {
        super()
        noSlash(network)
        noSlash(userId)
    }
    toString() {
        return `person:${this.network}/${this.userId}`
    }
    static [fromString](str: string) {
        const [network, userId] = str.split('/')
        if (!network || !userId) return null
        return new PersonIdentifier(network, userId)
    }
}
export class GroupIdentifier extends Identifier {
    constructor(public network: string, public groupId: string, public virtual = false) {
        super()
        noSlash(network)
        noSlash(groupId)
    }
    toString() {
        return `group:${this.network}/${this.groupId}/${this.virtual ? 'virtual' : 'real'}`
    }
    static [fromString](str: string) {
        const [network, groupId, virtual] = str.split('/')
        if (!network || !groupId || !virtual) return null
        return new GroupIdentifier(network, groupId, virtual === 'virtual')
    }
}
export class PostIdentifier extends Identifier {
    /**
     * If identifier is a PostIdentifier, that means this post is binded with other post in some kind
     * e.g. a comment.
     */
    constructor(public identifier: Identifier, public postId: string) {
        super()
        noSlash(postId)
    }
    toString() {
        return `post:${this.postId}/${this.identifier.toString()}`
    }
    static [fromString](str: string) {
        const [postId, ...identifier] = str.split('/')
        const id = Identifier.fromString(identifier.join('/'))
        if (!id || !postId) return null
        return new PostIdentifier(id, postId)
    }
}
