import { describe, expect, test } from 'vitest'
import { Create2Factory } from '../../src/libs/Create2Factory.js'

describe('Create2Factory', () => {
    const create2Factory = new Create2Factory('0x0000000000000000000000000000000000000000')

    test('getDeployedAddress', () => {
        expect(create2Factory.getDeployedAddress('0x0000000000000000000000000000000000000000', '0')).toBe(
            '0xc8086641b2f1e8af5b8a6d07d565a65086a451df',
        )
    })
})
