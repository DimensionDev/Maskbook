export enum NextIDPlatform {
    NextId = 'nextid',
    Twitter = 'twitter',
    KeyBase = 'keybase',
    Ethereum = 'ethereum',
    Github = 'github',
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
    }[]
}

export interface NextIDBindings {
    ids: NextIDPersonaBindings[]
}
