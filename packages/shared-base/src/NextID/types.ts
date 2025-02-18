export enum NextIDAction {
    Create = 'create',
    Delete = 'delete',
}

export enum NextIDPlatform {
    NextID = 'nextid',
    Twitter = 'twitter',
    Keybase = 'keybase',
    Ethereum = 'ethereum',
    GitHub = 'github',
    ENS = 'ens',
    RSS3 = 'rss3',
    LENS = 'lens',
    REDDIT = 'reddit',
    SYBIL = 'sybil',
    EthLeaderboard = 'ethLeaderboard',
    SpaceId = 'space_id',
    Farcaster = 'farcaster',
    Bit = 'dotbit',
    Unstoppable = 'unstoppabledomains',
    CyberConnect = 'cyberconnect',
}
export { NextIDPlatform as Web3BioPlatform }

export interface NextIDEnsRecord {
    category: 'ENS'
    chain: string
    id: string
    uuid: string
}

export interface NextIDIdentity {
    uuid: string
    platform: NextIDPlatform
    /**
     * Uid on target platform. uid is the unique ID on each platform e.g. for
     * Farcaster, this is the fid, for Lens this is the lens profile_id(0xabcd)
     */
    uid?: string
    identity: string
    displayName: string
    nft: NextIDEnsRecord[]
}

export interface NextIDErrorBody {
    message?: string
}

export interface NextIDPayload {
    postContent: string
    signPayload: string
    uuid: string
    createdAt: string
}

export interface Binding {
    platform: NextIDPlatform
    identity: string
}

export interface NextIDPersonaBindings {
    activated_at: string
    persona: string
    proofs: BindingProof[]
}

export interface BindingProof {
    platform: NextIDPlatform
    source?: NextIDPlatform
    /**
     * Platform identity.
     * For Twitter, it's twitter account
     */
    identity: string
    uid?: NextIDIdentity['uid']
    name: string
    created_at: string
    latest_checked_at?: string
    is_valid: boolean
    last_checked_at: string
    /**
     * @deprecated
     * legacy data
     */
    isDefault?: 0 | 1
    /**
     * @deprecated
     * legacy data
     */
    isPublic?: 0 | 1
    // Some other related bindings, like some other ens
    relatedList?: BindingProof[]
    link?: string
}

interface Pagination {
    total: number
    per: number
    current: number
    next: number
}

export interface NextIDBindings {
    pagination: Pagination
    ids: NextIDPersonaBindings[]
}

// #region kv server
export interface NextIDStoragePayload {
    uuid: string
    signPayload: string
    createdAt: string
}
export interface NextIDStorageInfo<T = unknown> {
    persona: string
    proofs: Array<NextIDStorageProofs<T>>
}
export interface NextIDStorageProofs<T> {
    content: {
        // pluginID
        [index: string]: T
    }
    identity: string
    platform: NextIDPlatform
}
// #endregion
