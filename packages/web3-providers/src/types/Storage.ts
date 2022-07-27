export namespace StorageAPI {
    export interface Storage<T> {
        get(key: string): Promise<T | undefined>
        set(key: string, value: T): Promise<void>
        delete?(key: string): Promise<void>
    }

    export interface Provider {
        createJSON_Storage?<T>(key: string): Storage<T>
        createBinaryStorage?<T>(key: string): Storage<T>
    }
}
