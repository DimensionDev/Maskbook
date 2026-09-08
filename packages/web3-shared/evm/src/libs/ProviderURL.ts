import { getABTestSeed } from '@masknet/web3-telemetry/helpers'
import { getPublicRPCUrls } from '../constants/viem-chains.js'
import type { ChainId } from '../types/index.js'

export const ProviderURL = {
    from(chainId: ChainId) {
        const urls = getPublicRPCUrls(chainId)
        if (!urls.length) throw new Error(`No RPC presets at chainId: ${chainId}.`)
        return urls[getABTestSeed() % urls.length]
    },

    fromOfficial(chainId: ChainId) {
        const urls = getPublicRPCUrls(chainId)
        if (!urls.length) throw new Error(`No RPC presets at chainId: ${chainId}.`)
        return urls[0]
    },
}
