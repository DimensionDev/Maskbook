import { describe, test, expect } from 'vitest'
import { UserTransaction } from '../../src/libs/UserTransaction.js'
import { ChainId, UserOperation } from '../../src/types/index.js'

const userOperation: UserOperation = {
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
}

describe('UserTransaction', async () => {
    const userTransaction = await UserTransaction.fromUserOperation(
        ChainId.Matic,
        '0x0000000000000000000000000000000000000000',
        userOperation,
    )

    test('hasPaymaster', () => {
        expect(userTransaction.hasPaymaster).toBe(true)
    })

    test('pack', () => {
        expect(userTransaction.pack).toBeTruthy()
    })

    test('packAll', () => {
        expect(userTransaction.packAll).toBeTruthy()
    })

    test('hash', () => {
        const hash = '0xa291d506adc38a60c6539bd4eef7dcd01a04b84d5196a12d91bd39d8903c5c30'
        expect(userTransaction.hash).toBe(hash)
    })

    test('requestId', () => {
        const id = '0x4306460833ca3f38b308db101c2c411671cdbe9f2b511b00e56df9288702a5f4'
        expect(userTransaction.requestId).toBe(id)
    })
})
