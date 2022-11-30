import { describe, test, expect } from 'vitest'
import { UserTransaction } from '../../src/libs/UserTransaction.js'
import { ChainId, UserOperation } from '../../src/types/index.js'

const userOperation: UserOperation = {
    sender: '0x0000000000000000000000000000000000000000',
    nonce: '0x0000000000000000000000000000000000000000',
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

describe('UserTransaction', () => {
    const userTransaction = new UserTransaction(
        ChainId.Mainnet,
        '0x0000000000000000000000000000000000000000',
        userOperation,
    )

    test('sender', () => {
        expect(userTransaction.sender).toBe(userOperation.sender)
    })

    test('initCode', () => {
        expect(userTransaction.initCode).toBe(userOperation.initCode)
    })

    test('hasPaymaster', () => {
        expect(userTransaction.hasPaymaster).toBe(false)
    })

    test('pack', () => {
        expect(userTransaction.pack).toBeTruthy()
    })

    test('hash', () => {
        const hash = '0x2714ac199129eaf48570adf18ce5c6849ac1203a6b92d72bdb52ae816cfc72a2'
        expect(userTransaction.hash).toBe(hash)
    })

    test('requestId', () => {
        const id = '0x1d3bc0ca567dd9b2c15d2cb24c54c2a6c61204b16c8cdae81dc56dc4e562f394'
        expect(userTransaction.requestId).toBe(id)
    })
})
