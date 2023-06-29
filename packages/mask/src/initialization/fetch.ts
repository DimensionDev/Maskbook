import { contentFetch } from '../utils/fetcher.js'

Reflect.defineProperty(globalThis, 'fetch', {
    configurable: true,
    get() {
        Reflect.defineProperty(globalThis, 'fetch', {
            writable: true,
            configurable: true,
            enumerable: true,
            value: contentFetch,
        })
        return contentFetch
    },
    set(value) {
        Reflect.defineProperty(globalThis, 'fetch', {
            writable: true,
            configurable: true,
            enumerable: true,
            value,
        })
    },
})
