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
        '0x0000000000000000000000000000000000000004',
        userOperation,
    )

    test('sender', () => {
        expect(userTransaction.sender).toBe(userOperation.sender)
    })

    test('initCode', () => {
        expect(userTransaction.initCode).toBe(userOperation.initCode)
    })

    test('hasPaymaster', () => {
        expect(userTransaction.hasPaymaster).toBeFalsy()
    })

    test('pack', () => {
        expect(userTransaction.pack).toBeTruthy()
    })

    test('hash', () => {
        const hash = '0x2714ac199129eaf48570adf18ce5c6849ac1203a6b92d72bdb52ae816cfc72a2'
        expect(userTransaction.hash).toBe(hash)
    })

    test('requestId', () => {
        const id = '0xf33844625f678d4ad0a3ac0e10ef69684891771fb945db111dcdb3fd1b9f84a0'
        expect(userTransaction.requestId).toBe(id)
    })
})
