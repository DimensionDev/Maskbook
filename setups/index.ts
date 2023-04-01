import { fetch, Headers, Request, Response } from 'cross-fetch'
import { afterAll, afterEach, beforeAll } from 'vitest'
import { setupServer } from 'msw/node'
import { BundlerHandlers } from './handlers/SmartPayBundler.js'
import { DSearchHandlers } from './handlers/DSearch.js'

// Add `fetch` polyfill.
globalThis.fetch = fetch
globalThis.Headers = Headers
globalThis.Request = Request
globalThis.Response = Response
globalThis.localStorage = (() => {
    const map = new Map()

    return {
        getItem(key: string) {
            return map.get(key)
        },
        setItem(key: string, value: unknown) {
            map.set(key, value)
        },
        removeItem(key: string) {
            map.delete(key)
        },
        clear() {
            map.clear()
        },
        key(index: number) {
            // TODO: implement it when we need it.
            return ''
        },
        get length() {
            return map.size
        },
    }
})()

// Add `navigator` polyfill.
// @ts-ignore
globalThis.navigator = {
    userAgent: 'vitest',
    language: 'en',
}

// Add `screen` polyfill.
// @ts-ignore
globalThis.screen = {
    width: 0,
    height: 0,
}

const server = setupServer(...BundlerHandlers, ...DSearchHandlers)

// Start server before all tests
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))

//  Close server after all tests
afterAll(() => server.close())

// Reset handlers after each test `important for test isolation`
afterEach(() => server.resetHandlers())
