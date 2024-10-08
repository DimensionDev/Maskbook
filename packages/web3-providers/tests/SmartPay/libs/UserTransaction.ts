import { describe, test, expect } from 'vitest'
import { ChainId } from '@masknet/web3-shared-evm'
import { UserTransaction } from '../../../src/SmartPay/libs/UserTransaction.js'

describe('UserTransaction', async () => {
    const userTransaction = new UserTransaction(ChainId.Polygon, '0x0000000000000000000000000000000000000000', {
        sender: '0x0000000000000000000000000000000000000000',
        nonce: 0,
        initCode: '0x',
        callData: '0x',
        callGas: '0',
        verificationGas: '100000',
        preVerificationGas: '100000',
        maxFeePerGas: '100000',
        maxPriorityFeePerGas: '100000',
        paymaster: '0x0000000000000000000000000000000000000000',
        paymasterData: '0x',
        signature: '0x',
    })

    test('hasPaymaster', () => {
        expect(userTransaction.hasPaymaster).toBe(false)
    })

    test('pack', () => {
        expect(userTransaction.pack).toBeTruthy()
    })

    test('packAll', () => {
        expect(userTransaction.packAll).toBeTruthy()
    })

    test('hash', () => {
        const hash = '0x2714ac199129eaf48570adf18ce5c6849ac1203a6b92d72bdb52ae816cfc72a2'
        expect(userTransaction.hash).toBe(hash)
    })

    test('requestId', () => {
        const id = '0x4c8c9017e6e601e9e23fd988e0ae770f12c719844b981948352ee04fe373f7f3'
        expect(userTransaction.requestId).toBe(id)
    })
})
