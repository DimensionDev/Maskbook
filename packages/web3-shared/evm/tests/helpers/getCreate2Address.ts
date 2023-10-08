import { describe, expect, test } from 'vitest'
import { getCreate2Address } from '@ethersproject/address'

describe('getCreate2Address', () => {
    test('should get create2 address', () => {
        expect(getCreate2Address()).toBe('0x')
    })
})
