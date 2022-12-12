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
        const hash = '0x05a465d3001f59b9ddec7b1fb87454e4902c5b3bae0f020da88e4eea475f6516'
        expect(userTransaction.hash).toBe(hash)
    })

    test('requestId', () => {
        const id = '0x6a955662926a9a874cd05d21ed9481ee5bade1669b40b804e347393c87981f3a'
        expect(userTransaction.requestId).toBe(id)
    })
})
