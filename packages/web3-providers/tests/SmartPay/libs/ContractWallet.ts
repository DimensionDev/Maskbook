import { describe, expect, test } from 'vitest'
import { ChainId } from '@masknet/web3-shared-evm'
import { ContractWallet } from '../../../src/SmartPay/libs/ContractWallet.js'

describe('ContractWallet', () => {
    const wallet = new ContractWallet(
        ChainId.Matic,
        '0x0000000000000000000000000000000000000000',
        '0x0000000000000000000000000000000000000000',
        '0x0000000000000000000000000000000000000000',
    )

    test('initCode', () => {
        expect(wallet.initCode).toBeTruthy()
    })
})
