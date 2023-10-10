import { describe, expect, test } from 'vitest'
import { pack } from '../../src/helpers/pack.js'

const ADDRESS = '0x1234567890123456789012345678901234567890'
const UINT256 = 1

const ADDRESS_PACKED = '0x12345678901234567890123456789012345678901234567890123456789012345678901234567890'
const ADDRESS_UINT256_PACKED =
    '0x12345678901234567890123456789012345678900000000000000000000000000000000000000000000000000000000000000001'

describe('pack', () => {
    test('should pack address', () => {
        expect(pack(['address', 'address'], [ADDRESS, ADDRESS])).toBe(ADDRESS_PACKED)
    })

    test('should pack unit256', () => {
        expect(pack(['address', 'uint256'], [ADDRESS, UINT256])).toBe(ADDRESS_UINT256_PACKED)
    })
})
