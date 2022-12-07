import { fetch } from 'cross-fetch'
import { afterAll, afterEach, beforeAll } from 'vitest'
import { setupServer } from 'msw/node'
import { AccountHandlers } from './handlers/SmartPayAccount.js'
import { BundlerHandlers } from './handlers/SmartPayBundler.js'
import { DSearchHandlers } from './handlers/DSearch.js'

// Add `fetch` polyfill.
global.fetch = fetch

const server = setupServer(...AccountHandlers, ...BundlerHandlers, ...DSearchHandlers)

// Start server before all tests
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))

//  Close server after all tests
afterAll(() => server.close())

// Reset handlers after each test `important for test isolation`
afterEach(() => server.resetHandlers())
