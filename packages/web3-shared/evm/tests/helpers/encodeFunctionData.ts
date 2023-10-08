import { describe, test, expect } from 'vitest'
import type { AbiItem } from 'web3-utils'
import { encodeFunctionData } from '../../src/helpers/encodeFunctionData.js'

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
] satisfies AbiItem[]

describe('encodeFunctionData', () => {
    test('should encode function call', () => {
        const result = encodeFunctionData(ERC20, ['0x8ba1f109551bd432803012645ac136ddd64dba72', '0x0'], 'approve')
        expect(result).toBe(
            '0x095ea7b30000000000000000000000008ba1f109551bd432803012645ac136ddd64dba720000000000000000000000000000000000000000000000000000000000000000',
        )
    })
})
