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

export interface NextIDPersonaBindings {
    persona: string
    proofs: {
        platform: string
        identity: string
        created_at: string
        invalid_reason: string
        is_valid: boolean
        laset_checked_at: string
    }[]
}

export interface NextIDBindings {
    ids: NextIDPersonaBindings[]
}
