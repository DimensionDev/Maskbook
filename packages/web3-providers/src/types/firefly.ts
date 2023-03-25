export namespace FireflyBaseAPI {
    export interface MetaData {
        value: string
    }

    export interface Provider {
        get<T>(namespace: string, userId: string, address: string): Promise<T>
        set<T>(namespace: string, userId: string, address: string, value: T, signature: string): Promise<void>
    }
}
