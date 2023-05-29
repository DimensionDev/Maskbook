import type { ECKeyIdentifier, NextIDPlatform } from '@masknet/shared-base'

export namespace StorageAPI {
    export interface Storage {
        has(key: string): Promise<boolean>
        get<T>(key: string): Promise<T | undefined>
        getAll?<T>(key: string): Promise<T[] | undefined>
        set<T>(key: string, value: T): Promise<void>
        delete?(key: string): Promise<void>
        clearAll?(): Promise<void>
    }

    export interface Provider {
        createKVStorage: (namespace: string) => Storage
        createRSS3Storage: (namespace: string) => Storage
        createNextIDStorage: (
            proofIdentity: string,
            platform: NextIDPlatform,
            signerOrPublicKey: string | ECKeyIdentifier,
        ) => Storage
        createFireflyStorage: (namespace: string, address: string) => Storage
    }
}
