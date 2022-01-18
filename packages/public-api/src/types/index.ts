export interface JsonRpcPayload {
    jsonrpc: string
    method: string
    params: any[]
    id?: string | number
}

export interface JsonRpcResponse {
    jsonrpc: string
    id: number
    result?: any
    error?: string
}

export interface PersonaRecord {
    identifier: string
    mnemonic?: {
        words: string
        parameter: { path: string; withPassword: string }
    }
    publicKey: string
    privateKey?: string
    localKey?: string // ?
    nickname?: string
    linkedProfiles: Map<string, { connectionConfirmState: 'confirmed' | 'pending' | 'denied' }> // ?
    createAt: string
    updateAt: string
    hasLogout?: boolean
    uninitialized?: boolean
}

export interface ProfileRecord {
    identifier: string
    nickname?: string
    localKey?: string // ?
    linkedPersona?: string
    createAt?: string
    updateAt?: string
}

export type PageOption = {
    pageSize: number
    pageOffset: number
}
