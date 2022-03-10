export enum NextIDAction {
    Create = 'create',
    Delete = 'delete',
}

export enum NextIDPlatform {
    NextId = 'nextid',
    Twitter = 'twitter',
    Keybase = 'keybase',
    Ethereum = 'ethereum',
    GitHub = 'github',
}

export interface NextIDPayload {
    postContent: string
    signPayload: string
}

export interface Binding {
    platform: NextIDPlatform
    identity: string
}

export interface NextIDPersonaBindings {
    persona: string
    proofs: {
        platform: NextIDPlatform
        identity: string
        created_at: string
        invalid_reason: string
        latest_checked_at: string
        is_valid: boolean
    }[]
}

export interface NextIDBindings {
    ids: NextIDPersonaBindings[]
}
