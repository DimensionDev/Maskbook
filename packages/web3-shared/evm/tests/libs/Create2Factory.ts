import { describe, expect, test } from 'vitest'
import { isValidAddress } from '../../src/helpers/address.js'
import { Create2Factory } from '../../src/libs/Create2Factory.js'

describe('Create2Factory', () => {
    const create2Factory = new Create2Factory('0x0000000000000000000000000000000000000000')

    test('getDeployedAddress', () => {
        expect(create2Factory.derive('0x0000000000000000000000000000000000000000').every(isValidAddress)).toBeTruthy()
    })
})
