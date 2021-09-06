import { serialize } from '../serializer'
import { Result, Ok, Err } from 'ts-results'

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
 * ec_key:...
 */
type Identifiers = 'person' | 'group' | 'post' | 'post_iv' | 'ec_key'
const fromStringCache = new Map<string, Identifier | undefined | null>()

interface IdentifierFromString {
    /**
     * fromString("some string", ProfileIdentifier)
     * fromString("some string", ECKeyIdentifier)
     */
    <T extends Identifier>(id: string, c: new (...args: any[]) => T): Result<T, TypeError>
    /**
     * fromString("some string")
     */
    (id: string): Result<Identifier, TypeError>
    /**
     * fromString(identifier) // typeof identifier
     */
    // <T extends Identifier>(id: T): T
}
const fromString = (id: string | Identifier, constructor?: typeof Identifier): Result<Identifier, TypeError> => {
    let result: Identifier | undefined | null = null
    // the third overload
    if (id instanceof Identifier) result = id
    else {
        const [type, ...rest] = id.split(':') as [Identifiers, string]
        // the second overload
        if (fromStringCache.has(id)) result = fromStringCache.get(id)
        else if (type === 'person') result = ProfileIdentifier[$fromString](rest.join(':'))
        else if (type === 'group') result = GroupIdentifier[$fromString](rest.join(':'))
        else if (type === 'post') result = PostIdentifier[$fromString](rest.join(':'))
        else if (type === 'post_iv') result = PostIVIdentifier[$fromString](rest.join(':'))
        else if (type === 'ec_key') result = ECKeyIdentifier[$fromString](rest.join(':'))
        else return Err(new TypeError('Unreachable case:' + type))
        fromStringCache.set(id, result)
    }
    const err = Err(
        new TypeError(
            `Can't cast to Identifier. Expected: ${
                constructor?.name || 'Any Identifier'
            }, Try to convert from string: ${id}`,
        ),
    )
    if (!constructor) return result ? Ok(result) : err
    // the first overload
    else if (result instanceof constructor) return Ok(result)
    else return err
}
export abstract class Identifier {
    static equals(a?: Identifier | null, b?: Identifier | null) {
        return !!a?.equals(b)
    }
    public equals(other: Identifier | null | undefined) {
        if (!other) return false
        return this === other || this.toText() === other.toText()
    }
    abstract toText(): string
    static fromString: IdentifierFromString = fromString as any

    static IdentifiersToString(a: Identifier[], isOrderImportant = false) {
        const ax = a.map((x) => x.toText())
        if (!isOrderImportant) {
            ax.sort()
        }
        return ax.join(',')
    }
}
export class ProfileIdentifier extends Identifier {
    static getUserName(x: string | ProfileIdentifier): string | null {
        if (typeof x === 'string') {
            if (['', '$unknown'].includes(x)) return null
            return x
        } else {
            if (x.isUnknown) return null
            return x.userId
        }
    }
    static readonly unknown = new ProfileIdentifier('localhost', '$unknown')
    get isUnknown() {
        return this.equals(ProfileIdentifier.unknown)
    }
    /**
     * @param network - Network belongs to
     * @param userId - User ID
     */
    constructor(public readonly network: string, public readonly userId: string) {
        super()
        noSlash(network)
        noSlash(userId)
    }
    toText() {
        return `person:${this.network}/${this.userId}`
    }
    friendlyToText() {
        return `${this.userId}@${this.network}`
    }
    static [$fromString](str: string) {
        const [network, userId] = str.split('/')
        if (!network || !userId) return null
        return new ProfileIdentifier(network, userId)
    }
}
serialize('ProfileIdentifier')(ProfileIdentifier)
export class GroupIdentifier extends Identifier {
    static getFriendsGroupIdentifier(who: ProfileIdentifier, groupId: string) {
        return new GroupIdentifier(who.network, who.userId, groupId)
    }
    constructor(
        public readonly network: string,
        public readonly virtualGroupOwner: string | null,
        public readonly groupID: string,
    ) {
        super()
        noSlash(network)
        noSlash(groupID)
        if (virtualGroupOwner === '') this.virtualGroupOwner = null
    }
    get ownerIdentifier(): ProfileIdentifier | null {
        if (this.virtualGroupOwner === null) return null
        return new ProfileIdentifier(this.network, this.virtualGroupOwner)
    }
    toText() {
        return 'group:' + [this.network, this.virtualGroupOwner, this.groupID].join('/')
    }
    get isReal() {
        return !this.virtualGroupOwner
    }
    get isVirtual() {
        return !!this.virtualGroupOwner
    }
    static [$fromString](str: string) {
        const [network, belongs, groupID] = str.split('/')
        if (!network || !groupID) return null
        return new GroupIdentifier(network, belongs, groupID)
    }
}
serialize('GroupIdentifier')(GroupIdentifier)
export class PostIdentifier<T extends Identifier = Identifier> extends Identifier {
    static readonly unknown = new PostIdentifier(ProfileIdentifier.unknown, '$unknown')
    get isUnknown() {
        return this.equals(PostIdentifier.unknown)
    }
    /**
     * If identifier is a PostIdentifier, that means this post is bound with other post in some kind
     * e.g. a comment.
     */
    constructor(public readonly identifier: T, public readonly postId: string) {
        super()
        noSlash(postId)
    }
    toText() {
        return `post:${this.postId}/${this.identifier.toText()}`
    }
    static [$fromString](str: string) {
        const [postId, ...identifier] = str.split('/')
        const id = Identifier.fromString(identifier.join('/'))
        if (id.err || !postId) return null
        return new PostIdentifier(id.val, postId)
    }
}
serialize('PostIdentifier')(PostIdentifier)
export class PostIVIdentifier extends Identifier {
    constructor(public readonly network: string, public readonly postIV: string) {
        super()
    }
    toText() {
        return `post_iv:${this.network}/${this.postIV.replace(/\//g, '|')}`
    }
    static [$fromString](str: string) {
        const [network, iv] = str.split('/')
        if (!network || !iv) return null
        return new PostIVIdentifier(network, iv)
    }
}
serialize('PostIVIdentifier')(PostIVIdentifier)

/**
 * This class identify the point on an EC curve.
 * ec_key:secp256k1/CompressedPoint
 */
export class ECKeyIdentifier extends Identifier {
    public readonly type = 'ec_key'
    constructor(public readonly curve: 'secp256k1', public readonly compressedPoint: string) {
        super()
    }
    /** This property might be filled with old data, which means you MUST NOT change the property name */
    private declare readonly encodedCompressedKey: string
    toText() {
        const normalized = this.encodedCompressedKey ?? this.compressedPoint.replace(/\//g, '|')
        return `ec_key:${this.curve}/${normalized}`
    }
    static [$fromString](str: string) {
        const [curve, point] = str.split('/')
        if (curve !== 'secp256k1') return null
        return new ECKeyIdentifier(curve, point)
    }
}
serialize('ECKeyIdentifier')(ECKeyIdentifier)
export type PersonaIdentifier = ECKeyIdentifier
// eslint-disable-next-line no-redeclare
export const PersonaIdentifier = [ECKeyIdentifier]

/**
 * Because "/" is used to split parts in identifier
 * we should reject the "/"
 *
 * If you want to use it, you must first convert to something other
 */
function noSlash(str?: string) {
    if (!str) return
    if (str.includes('/')) throw new TypeError('Cannot contain / in a part of identifier')
}
