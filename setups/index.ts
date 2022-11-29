import { fetch } from 'cross-fetch'
import { afterAll, afterEach, beforeAll } from 'vitest'
import { setupServer } from 'msw/node'
import { BundlerHandlers } from './handlers/SmartPayBundler.js'

// Add `fetch` polyfill.
global.fetch = fetch

const server = setupServer(...BundlerHandlers)

// Start server before all tests
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))

//  Close server after all tests
afterAll(() => server.close())

// Reset handlers after each test `important for test isolation`
afterEach(() => server.resetHandlers())

server.printHandlers()
