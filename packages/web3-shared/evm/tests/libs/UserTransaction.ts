import { toWei } from 'web3-utils'
import { describe, test, expect } from 'vitest'
import { UserTransaction } from '../../src/libs/UserTransaction.js'
import { UserOperation } from '../../src/types/index.js'

const userOperation: UserOperation = {
    sender: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
    nonce: 0,
    initCode: '0x',
    callData: '0x',
    callGasLimit: '0',
    verificationGasLimit: '100000',
    preVerificationGas: '21000',
    maxFeePerGas: '0',
    maxPriorityFeePerGas: '1000000000',
    paymasterAndData: '0x',
    signature: '0x',
}

describe('UserTransaction', () => {
    const userTransaction = new UserTransaction(userOperation)

    test('sender', () => {
        expect(userTransaction.sender).toBe(userOperation.sender)
    })

    test('hasPaymaster', () => {
        expect(userTransaction.hasPaymaster).toBeTruthy()
    })
})
