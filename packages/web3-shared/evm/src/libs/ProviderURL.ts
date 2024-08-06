import { getRPCConstants } from '../constants/constants.js'
import type { ChainId } from '../types/index.js'

export class ProviderURL {
    static from(chainId: ChainId) {
        const { RPC_URLS, RPC_WEIGHTS } = getRPCConstants(chainId)

        if (!RPC_URLS || !RPC_WEIGHTS) throw new Error(`No RPC presets at chainId: ${chainId}.`)
        return RPC_URLS[RPC_WEIGHTS[0]]
    }

    static fromOfficial(chainId: ChainId) {
        const { RPC_URLS_OFFICIAL } = getRPCConstants(chainId)
        if (!RPC_URLS_OFFICIAL?.length) throw new Error(`No RPC presets at chainId: ${chainId}.`)
        return RPC_URLS_OFFICIAL[0]
    }
}
