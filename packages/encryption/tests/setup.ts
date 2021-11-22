import { beforeAll, test } from '@jest/globals'
import { webcrypto } from 'crypto'
import { atob, btoa } from 'buffer'

test('Setup env', () => {})
beforeAll(() => {
    Object.assign(globalThis, { crypto: webcrypto, atob, btoa })
})
