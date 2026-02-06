import { describe, test, expect } from 'vitest'
import { decodeFunctionParams } from '../../src/helpers/decodeFunctionParams.js'
import type { AbiFunction } from 'viem'

const ERC20 = [
    {
        constant: false,
        inputs: [
            {
                name: '_spender',
                type: 'address',
            },
            {
                name: '_value',
                type: 'uint256',
            },
        ],
        name: 'approve',
        outputs: [
            {
                name: '',
                type: 'bool',
            },
        ],
        payable: false,
        stateMutability: 'nonpayable',
        type: 'function',
    },
] satisfies AbiFunction[]

const DATA =
    '0x095ea7b30000000000000000000000008ba1f109551bd432803012645ac136ddd64dba720000000000000000000000000000000000000000000000000000000000000000'

describe('encode & decode function data', () => {
    test('should decode function data', () => {
        const result = decodeFunctionParams(ERC20, DATA, 'approve')

        expect(result[0]).toBe('0x8ba1f109551bD432803012645Ac136ddd64DBA72')
        expect(result[1]).toBe(0n)
    })
})
