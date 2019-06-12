import { serializable } from '../utils/type-transform/Serialization'

type Identifiers = 'person' | 'group' | 'post'
const fromString = Symbol()
function noSlash(str?: string) {
    if (!str) return
    if (str.split('/')[1]) throw new TypeError('Cannot contain / in a part of identifier')
}
export abstract class Identifier {
    public equals(other: Identifier) {
        return this === other || this.toText() === other.toText()
    }
    abstract toText(): string
    static fromString<T extends Identifier>(id: T): T
    static fromString(id: string): Identifier | null
    static fromString<T extends Identifier>(id: string | T): Identifier | null {
        if (id instanceof Identifier) return id
        const [type, ...rest] = id.split(':') as [Identifiers, string]
        switch (type) {
            case 'person':
                return PersonIdentifier[fromString](rest.join(':'))
            case 'group':
                return GroupIdentifier[fromString](rest.join(':'))
            case 'post':
                return PostIdentifier[fromString](rest.join(':'))
            default:
                return null
        }
    }
}

@serializable('PersonIdentifier')
export class PersonIdentifier extends Identifier {
    static unknown = new PersonIdentifier('localhost', '$unknown')
    get isUnknown() {
        return this.equals(PersonIdentifier.unknown)
    }
    /**
     * @param network - Network belongs to
     * @param userId - User ID
     */
    constructor(public network: string, public userId: string) {
        super()
        noSlash(network)
        noSlash(userId)
    }
    toText() {
        return `person:${this.network}/${this.userId}`
    }
    static [fromString](str: string) {
        const [network, userId] = str.split('/')
        if (!network || !userId) return null
        return new PersonIdentifier(network, userId)
    }
}

@serializable('GroupIdentifier')
export class GroupIdentifier extends Identifier {
    constructor(public network: string, public groupId: string, public virtual = false) {
        super()
        noSlash(network)
        noSlash(groupId)
    }
    toText() {
        return `group:${this.network}/${this.groupId}/${this.virtual ? 'virtual' : 'real'}`
    }
    static [fromString](str: string) {
        const [network, groupId, virtual] = str.split('/')
        if (!network || !groupId || !virtual) return null
        return new GroupIdentifier(network, groupId, virtual === 'virtual')
    }
}

@serializable('PostIdentifier')
export class PostIdentifier<T extends Identifier = Identifier> extends Identifier {
    readonly type = 'post'
    /**
     * If identifier is a PostIdentifier, that means this post is binded with other post in some kind
     * e.g. a comment.
     */
    constructor(public identifier: T, public postId: string) {
        super()
        noSlash(postId)
    }
    toText() {
        return `post:${this.postId}/${this.identifier.toText()}`
    }
    static [fromString](str: string) {
        const [postId, ...identifier] = str.split('/')
        const id = Identifier.fromString(identifier.join('/'))
        if (!id || !postId) return null
        return new PostIdentifier(id, postId)
    }
}

export enum Relation {
    /**
     * Due to technical reasons,
     * if program cannot automatically verify the friendship or non-friendship,
     * use this level.
     */
    unknown = 'unknown',
    /**
     * I banned this person.
     * (Only available on some social networks)
     */
    IBanned = 'I banned',
    /**
     * This person bans me.
     * (Only available on some social networks)
     */
    IAmBanned = 'I am banned',
    /** I am following this person. So their post can appear in my timeline. */
    following = 'following',
    /** This person follows me. So my post can appear in their timeline. */
    followed = 'followed',
}
/**
 * Person representation in ui
 */
export interface PersonUI {
    identifier: PersonIdentifier
    previousIdentities?: PersonIdentifier[]
    relation: Relation[]
    nickname?: string
    avatar?: string
    fingerprint?: string
}
