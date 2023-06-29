import * as fetch /* webpackDefer: true */ from '../utils/fetcher.js'

Reflect.defineProperty(globalThis, 'fetch', {
    configurable: true,
    get() {
        Reflect.defineProperty(globalThis, 'fetch', {
            writable: true,
            configurable: true,
            enumerable: true,
            value: fetch.contentFetch,
        })
        return fetch.contentFetch
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
