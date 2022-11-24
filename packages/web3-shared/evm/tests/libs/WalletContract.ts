import { describe, expect, test } from 'vitest'
import { WalletContract } from '../../src/libs/WalletContract.js'

describe('WalletContract', () => {
    const walletContract = new WalletContract(
        '0x0000000000000000000000000000000000000000',
        '0x0000000000000000000000000000000000000000',
        '0x0000000000000000000000000000000000000000',
    )

    test('data', () => {
        expect(walletContract.data).toBeTruthy()
    })

    test('initCode', () => {
        expect(walletContract.initCode).toBeTruthy()
    })
})
