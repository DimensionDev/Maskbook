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

// Add `navigator` polyfill.
Reflect.set(globalThis, 'navigator', {
    userAgent: 'vitest',
    language: 'en',
} as Navigator)

// Add `screen` polyfill.
Reflect.set(globalThis, 'screen', {
    width: 0,
    height: 0,
} as Screen)

const server = setupServer(...BundlerHandlers, ...DSearchHandlers)

// Start server before all tests
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))

//  Close server after all tests
afterAll(() => server.close())

// Reset handlers after each test `important for test isolation`
afterEach(() => server.resetHandlers())
