export namespace StorageAPI {
    export interface Storage {
        has(key: string): Promise<boolean>
        get<T>(key: string): Promise<T | undefined>
        getAll?<T>(key: string): Promise<T[] | undefined>
        set<T>(key: string, value: T): Promise<void>
        delete?(key: string): Promise<void>
        clearAll?(): Promise<void>
    }
}
