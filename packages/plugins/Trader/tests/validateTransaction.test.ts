import { describe, expect, test } from 'vitest'
import { assertOKXContractTarget, assertOKXTransaction } from '../src/SiteAdaptor/trader/helpers/validateTransaction.js'

const account = '0x1111111111111111111111111111111111111111'
const token = '0x2222222222222222222222222222222222222222'
const router = '0x3333333333333333333333333333333333333333'

const transaction = {
    from: account,
    to: router,
    data: '0x12345678',
    value: '0',
}

describe('assertOKXTransaction', () => {
    test('accepts a contract call matching the requested ERC-20 swap', () => {
        expect(() =>
            assertOKXTransaction(transaction, {
                account,
                fromTokenAddress: token,
                requireZeroValueForERC20: true,
            }),
        ).not.toThrow()
    })

    test.each([
        [{ ...transaction, to: 'not-an-address' }, 'The transaction contains an invalid address.'],
        [{ ...transaction, from: router }, 'The transaction sender does not match.'],
        [{ ...transaction, to: token }, 'The transaction target is invalid.'],
        [{ ...transaction, data: '0x' }, 'The transaction data is invalid.'],
        [{ ...transaction, value: '1' }, 'An ERC-20 swap must not transfer native tokens.'],
    ])('rejects a transaction that violates the confirmed intent', (candidate, message) => {
        expect(() =>
            assertOKXTransaction(candidate, {
                account,
                fromTokenAddress: token,
                requireZeroValueForERC20: true,
            }),
        ).toThrow(message)
    })

    test('caps the native value at the requested swap amount', () => {
        expect(() =>
            assertOKXTransaction(
                { ...transaction, value: '11' },
                {
                    account,
                    fromTokenAddress: '0x0000000000000000000000000000000000000000',
                    inputAmount: '10',
                },
            ),
        ).toThrow('The transaction transfers more native tokens than requested.')
    })
})

describe('assertOKXContractTarget', () => {
    test('accepts deployed bytecode and rejects an EOA', () => {
        expect(() => assertOKXContractTarget('0x6000')).not.toThrow()
        expect(() => assertOKXContractTarget('0x')).toThrow('The transaction target is not a contract.')
        expect(() => assertOKXContractTarget('0xef01003333333333333333333333333333333333333333')).toThrow(
            'The transaction target is not a contract.',
        )
    })
})
