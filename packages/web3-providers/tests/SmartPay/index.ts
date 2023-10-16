import { describe, expect, test } from 'vitest'
import { SmartPayBundler } from '../../src/SmartPay/apis/BundlerAPI.js'

describe('SmartPayBundlerAPI', () => {
    test('healthz', async () => {
        const chainId = await SmartPayBundler.getSupportedChainId()
        expect(chainId).toBeTruthy()
    })
})
