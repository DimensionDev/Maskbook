export namespace StringStorageBaseAPI {
    export interface MetaData {
        value: string
    }

    export interface Provider {
        get(namespace: string, userId: string, address: string): Promise<string>
        set(namespace: string, userId: string, address: string, value: string, signature: string): Promise<void>
    }
}
