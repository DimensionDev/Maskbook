import { describe, expect, test } from 'vitest'
import { ChainId } from '../../src/index.js'
import { ContractWallet } from '../../src/libs/ContractWallet.js'

describe('ContractWallet', () => {
    const wallet = new ContractWallet(
        '0x0000000000000000000000000000000000000000',
        '0x0000000000000000000000000000000000000000',
        '0x0000000000000000000000000000000000000000',
        ChainId.Matic,
    )

    test('initCode', () => {
        expect(wallet.initCode).toBeTruthy()
    })
})
