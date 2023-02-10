import { describe, expect, test } from 'vitest'
import { SmartPayBundlerAPI } from '../../src/SmartPay/index.js'

describe('SmartPayBundlerAPI', () => {
    const SmartPayBundler = new SmartPayBundlerAPI()

    test('healthz', async () => {
        const chainId = await SmartPayBundler.getSupportedChainId()
        expect(chainId).toBeTruthy()
    })
})
