import { serializable } from '../utils/type-transform/Serialization'

/**
 * @internal symbol that used to construct this type from the Identifier
 */
const $fromString = Symbol()
/**
 * This type only refers to the stringified Identifier
 * person:...
 * group:...
 * post:...
 * post_iv:...
 */
type Identifiers = 'person' | 'group' | 'post' | 'post_iv'
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
                return PersonIdentifier[$fromString](rest.join(':'))
            case 'group':
                return GroupIdentifier[$fromString](rest.join(':'))
            case 'post':
                return PostIdentifier[$fromString](rest.join(':'))
            case 'post_iv':
                return PostIVIdentifier[$fromString](rest.join(':'))
            default:
                return null
        }
    }

    static IdentifiersToString(a: Identifier[], isOrderImportant = false) {
        const ax = a.map(x => x.toText())
        if (!isOrderImportant) {
            ax.sort()
        }
        return ax.join(',')
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
    static [$fromString](str: string) {
        const [network, userId] = str.split('/')
        if (!network || !userId) return null
        return new PersonIdentifier(network, userId)
    }
}

export enum GroupType {
    /**
     * This type of group is user defined in Maskbook and not exists at the social network itself
     */
    virtual = 'virtual',
    /**
     * This type of group is on the social network
     */
    real = 'real',
}
export enum PreDefinedVirtualGroupType {
    friends = 'friends',
}
@serializable('GroupIdentifier')
export class GroupIdentifier extends Identifier {
    constructor(public network: string, public groupID: string, public type: GroupType, public belongs?: string) {
        super()
        noSlash(network)
        noSlash(groupID)
        if (network && groupID && type) {
            this.assert()
        }
    }
    private assert() {
        if (!this.isReal && !this.belongs) throw new Error('Invalid group')
        if (this.isReal && this.belongs) throw new TypeError('A real group cannot have "belongs" field')
        if (this.isVirtual && !this.belongs) throw new TypeError('A virtual group must have "belongs" field')
    }
    toText() {
        this.assert()
        return 'group:' + [this.network, this.groupID, this.type, this.belongs].join('/')
    }
    get isReal() {
        return this.type === GroupType.real
    }
    get isVirtual() {
        return this.type === GroupType.virtual
    }
    static [$fromString](str: string) {
        const [network, groupID, virtual, belongs] = str.split('/')
        if (!network || !groupID || !virtual) return null
        try {
            return new GroupIdentifier(network, groupID, virtual as any, belongs)
        } catch {
            return null
        }
    }
}

@serializable('PostIdentifier')
export class PostIdentifier<T extends Identifier = Identifier> extends Identifier {
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
    static [$fromString](str: string) {
        const [postId, ...identifier] = str.split('/')
        const id = Identifier.fromString(identifier.join('/'))
        if (!id || !postId) return null
        return new PostIdentifier(id, postId)
    }
}

@serializable('PostIVIdentifier')
export class PostIVIdentifier extends Identifier {
    constructor(public network: string, public postIV: string) {
        super()
        if (postIV) this.postIV = postIV.replace(/\//g, '|')
    }
    toText() {
        return `post_iv:${this.network}/${this.postIV}`
    }
    static [$fromString](str: string) {
        const [network, iv] = str.split('/')
        if (!network || !iv) return null
        return new PostIVIdentifier(network, iv)
    }
}

/**
 * Because "/" is used to split parts in identifier
 * we should reject the "/"
 *
 * If you want to use it, you must first convert to something other
 */
function noSlash(str?: string) {
    if (!str) return
    if (str.split('/')[1]) throw new TypeError('Cannot contain / in a part of identifier')
}
