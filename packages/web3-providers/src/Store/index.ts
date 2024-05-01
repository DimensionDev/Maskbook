import { type StoreAPI } from '../types/Store.js'

export abstract class StoreProvider<T> implements StoreAPI.Provider<T> {
    public abstract store: T

    private callbacks = new Set<(store: T) => void>()

    updateStore = (updater: T | ((store: T) => T)) => {
        this.store = typeof updater === 'function' ? (updater as (store: T) => T)(this.store) : updater
        this.callbacks.forEach((callback) => callback(this.store))
    }

    subscribe = (callback: (store: T) => void): (() => void) => {
        this.callbacks.add(callback)
        return () => this.callbacks.delete(callback)
    }

    getSnapshot = (): T => {
        return this.store as T
    }
}
