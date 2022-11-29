import urlcat from 'urlcat'
import { describe, expect, test, afterAll, afterEach, beforeAll } from 'vitest'
import { ChainId } from '@masknet/web3-shared-evm'
import { SmartPayAccountAPI, SmartPayBundlerAPI } from '../../src/SmartPay/index.js'
import { BUNDLER_ROOT } from '../../src/SmartPay/constants.js'

describe('SmartPayBundlerAPI', () => {
    const SmartPayBundler = new SmartPayBundlerAPI()

    test('healthz', async () => {
        const chainIds = await SmartPayBundler.getSupportedChainIds()
        expect(chainIds.length).toBe(1)
        expect(chainIds[0]).toBe(ChainId.Matic)
    })
})

// describe('SmartPayAccountAPI', () => {
//     const SmartPayAccount = new SmartPayAccountAPI()
//     const ownerA = '0x0000000000000000000000000000000000000000'
//     const ownerB = '0x0000000000000000000000000000000000000001'

//     test.skipIf(() => true)('getAccounts', async () => {
//         const accounts = await SmartPayAccount.getAccounts(ChainId.Matic, [ownerA, ownerB])
//         expect(accounts.length).toBe(2)
//     })
// })
