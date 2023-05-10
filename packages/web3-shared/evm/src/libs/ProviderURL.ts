import { getABTestSeed } from '@masknet/shared-base'
import { getRPCConstants } from '../constants/constants.js'
import type { ChainId } from '../types/index.js'

let seed: number
export const ProviderURL = {
    from(chainId: ChainId) {
        const { RPC_URLS, RPC_WEIGHTS } = getRPCConstants(chainId)
        if (!RPC_URLS || !RPC_WEIGHTS) throw new Error(`No RPC presets at chainId: ${chainId}.`)

        return RPC_URLS[RPC_WEIGHTS[(seed ||= getABTestSeed()) % RPC_URLS.length]]
    },
    fromOfficial(chainId: ChainId) {
        const { RPC_URLS_OFFICIAL } = getRPCConstants(chainId)
        if (!RPC_URLS_OFFICIAL?.length) throw new Error(`No RPC presets at chainId: ${chainId}.`)

        return RPC_URLS_OFFICIAL[0]
    },
}
