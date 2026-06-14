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
    uid?: string
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
