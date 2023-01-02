import { describe, expect, test } from 'vitest'
import { ChainId } from '@masknet/web3-shared-evm'
import { SmartPayAccountAPI, SmartPayBundlerAPI } from '../../src/SmartPay/index.js'

describe('SmartPayBundlerAPI', () => {
    const SmartPayBundler = new SmartPayBundlerAPI()

    test('healthz', async () => {
        const chainId = await SmartPayBundler.getSupportedChainId()
        expect(chainId).toBeTruthy()
    })
})

describe('SmartPayAccountAPI', () => {
    const SmartPayAccount = new SmartPayAccountAPI()
    const ownerA = '0x0000000000000000000000000000000000000000'
    const ownerB = '0x0000000000000000000000000000000000000001'

    test('getAccounts', async () => {
        const accounts = await SmartPayAccount.getAccountsByOwners(ChainId.Matic, [ownerA, ownerB])
        expect(accounts.length).toBe(98)
    })
})
