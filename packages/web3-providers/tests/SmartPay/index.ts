import { describe, expect, test } from 'vitest'
import { SmartPayBundlerAPI } from '../../src/SmartPay/apis/BundlerAPI.js'

describe('SmartPayBundlerAPI', () => {
    const SmartPayBundler = new SmartPayBundlerAPI()

    test('healthz', async () => {
        const chainId = await SmartPayBundler.getSupportedChainId()
        expect(chainId).toBeTruthy()
    })
})
