export interface UnlockLocks {
    lock: {
        address: string
        chain: number
        name: string
        price?: string
    }
}

export interface UnlockLockInMetadata {
    unlocklock: string
    chainid: number
}

export interface UnlockProtocolMetadata {
    iv: string
    unlockLocks: UnlockLockInMetadata[]
    post: string
    key: string
}

export interface UnlockProtocolResponse {
    iv: string
    unlockLocks: UnlockLockInMetadata[]
    post: string
    unlockKey: string
}

export interface requestKeyResponse {
    message: string
    post: UnlockProtocolResponse
}
