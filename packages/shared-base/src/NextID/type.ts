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
    persona: string
    proofs: BindingProof[]
}

export interface BindingProof {
    platform: NextIDPlatform
    identity: string
    created_at: string
    invalid_reason: string
    latest_checked_at: string
    is_valid: boolean
    last_checked_at: string
    rawIdx?: number
    isDefault?: 0 | 1
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
    proofs: NextIDStorageProofs<T>[]
}
export interface NextIDStorageProofs<T> {
    content?: {
        // pluginId
        [index: string]: T
    }
    identity: string
    platform: NextIDPlatform
}
// #endregion
