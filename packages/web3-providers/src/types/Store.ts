export namespace StoreAPI {
    export interface Provider<Store> {
        subscribe: (callback: (store: Store | null) => void) => () => void
        getSnapshot: () => Store | null
    }
}
