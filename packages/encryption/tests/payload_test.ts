import { test, expect } from '@jest/globals'
import { parsePayload } from '../src'

test('1 + 1 == 2', async () => {
    expect((await parsePayload({})).err).toBeTruthy()
})
