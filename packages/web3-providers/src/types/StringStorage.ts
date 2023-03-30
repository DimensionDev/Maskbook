export namespace StringStorageBaseAPI {
    export interface MetaData {
        value: string
    }

    export interface Provider {
        get<T>(namespace: string, userId: string, address: string): Promise<T | undefined>
        set<T>(namespace: string, userId: string, address: string, value: T, signature: string): Promise<void>
    }
}
