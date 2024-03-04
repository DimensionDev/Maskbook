import { type StoreAPI } from '../types/Store.js'

export abstract class StoreProvider<T> implements StoreAPI.Provider<T> {
    private callbacks = new Set<(store: T | null) => void>()

    private store: T | null = null

    protected updateStore(updater: T | ((store: T | null) => T)): void {
        this.store = typeof updater === 'function' ? (updater as (store: T | null) => T)(this.store) : updater
        this.callbacks.forEach((callback) => callback(this.store))
    }

    subscribe(callback: (store: T | null) => void): () => void {
        this.callbacks.add(callback)
        return () => this.callbacks.delete(callback)
    }

    getSnapshot(): T {
        return this.store as T
    }
}
