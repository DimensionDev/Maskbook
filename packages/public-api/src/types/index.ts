export interface JsonRpcPayload {
    jsonrpc: string
    method: string
    params?: any[]
    id?: string | number
}

export interface JsonRpcResponse {
    jsonrpc: string
    id: number
    result?: any
    error?: string
}

export interface LinkedProfileDetails {
    connectionConfirmState: 'confirmed' | 'pending'
}

// These type MUST be sync with packages/shared-base/src/crypto/JWKType
export interface JsonWebKey {
    alg?: string
    crv?: string
    d?: string
    dp?: string
    dq?: string
    e?: string
    ext?: boolean
    k?: string
    key_ops?: string[]
    kty?: string
    n?: string
    oth?: RsaOtherPrimesInfo[]
    p?: string
    q?: string
    qi?: string
    use?: string
    x?: string
    y?: string
}
export interface RsaOtherPrimesInfo {
    d?: string
    r?: string
    t?: string
}
export interface EC_Public_JsonWebKey extends JsonWebKey, Nominal<'EC public'> {}
export interface EC_Private_JsonWebKey extends JsonWebKey, Nominal<'EC private'> {}
export interface AESJsonWebKey extends JsonWebKey, Nominal<'AES'> {}

declare class Nominal<T> {
    /** Ghost property, don't use it! */
    private __brand: T
}

export interface PersonaRecord {
    identifier: string
    mnemonic?: {
        words: string
        parameter: { path: string; withPassword: boolean }
    }
    publicKey: EC_Public_JsonWebKey
    privateKey?: EC_Private_JsonWebKey
    localKey?: AESJsonWebKey
    nickname?: string
    linkedProfiles: Record<string, LinkedProfileDetails>
    createdAt: number
    updatedAt: number
    hasLogout?: boolean
    uninitialized?: boolean
}

export type MobileRecipientReason =
    | { type: 'auto-share'; at: number }
    | { type: 'direct'; at: number }
    | { type: 'group'; group: any; at: number }

export interface MobileRecipientDetail {
    reason: MobileRecipientReason[]
}

export interface MobilePostRecord {
    /**
     * For old data stored before version 3, this identifier may be ProfileIdentifier.unknown
     */
    postBy: string
    identifier: string
    postCryptoKey?: object
    /**
     * Receivers
     */
    recipients: Record<string, MobileRecipientDetail>
    /** @deprecated */
    recipientGroups?: unknown
    /**
     * When does Mask find this post.
     * For your own post, it is when Mask created this post.
     * For others post, it is when you see it first time.
     */
    foundAt: number
    encryptBy?: string
    /** The URL of this post */
    url?: string
    /** Summary of this post (maybe front 20 chars). */
    summary?: string
    /** Interested metadata contained in this post. */
    interestedMeta?: ReadonlyMap<string, unknown>
}

export interface ProfileRecord {
    identifier: string
    nickname?: string
    localKey?: AESJsonWebKey
    linkedPersona?: string
    createdAt: number
    updatedAt: number
}

export enum RelationFavor {
    COLLECTED = -1,
    UNCOLLECTED = 1,
    DEPRECATED = 0,
}

export interface RelationRecord {
    profile: string
    linked: string
    network: string
    favor: RelationFavor
}

export type PageOption = {
    pageSize: number
    pageOffset: number
}

export interface RedPacketAvailability {
    token_address: string
    balance: string
    total: string
    claimed: string
    expired: boolean
    claimed_amount?: string
}