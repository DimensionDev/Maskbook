import { describe, expect, test } from 'vitest'
import { ChainId } from '@masknet/web3-shared-evm'
import { SmartPayAccountAPI } from '../../src/SmartPay/index.js'

describe('SmartPayAccountAPI', () => {
    const SmartPayAccount = new SmartPayAccountAPI()
    const ownerA = '0x0000000000000000000000000000000000000000'
    const ownerB = '0x0000000000000000000000000000000000000001'

    test.skipIf(() => true)('getAccounts', async () => {
        const accounts = await SmartPayAccount.getAccounts(ChainId.Matic, [ownerA, ownerB])
        expect(accounts.length).toBe(2)
    })
})
