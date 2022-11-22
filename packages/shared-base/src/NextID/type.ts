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
    created_at: string
    invalid_reason: string
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
