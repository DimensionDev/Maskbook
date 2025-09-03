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
