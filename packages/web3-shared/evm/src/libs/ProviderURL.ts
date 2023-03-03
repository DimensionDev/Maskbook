import { hexToNumber, sha3 } from 'web3-utils'
import { getRPCConstants } from '../constants/constants.js'
import type { ChainId } from '../types/index.js'

export class ProviderURL {
    /**
     * @deprecated Don't new ProviderEditor()
     * Use ProviderEditor.from(chainId) stead.
     */
    constructor() {}

    get footprint() {
        return sha3([navigator.userAgent, navigator.language, screen.width, screen.height].join())
    }

    get seed() {
        return this.footprint ? hexToNumber(this.footprint.slice(0, 10)) : 0
    }

    static from(chainId: ChainId) {
        const { RPC_URLS, RPC_WEIGHTS } = getRPCConstants(chainId)
        if (!RPC_URLS || !RPC_WEIGHTS) throw new Error(`No RPC presets at chainId: ${chainId}.`)

        return RPC_URLS[RPC_WEIGHTS[new ProviderURL().seed % RPC_URLS.length]]
    }

    static fromOfficial(chainId: ChainId) {
        const { RPC_URLS_OFFICIAL } = getRPCConstants(chainId)
        if (!RPC_URLS_OFFICIAL?.length) throw new Error(`No RPC presets at chainId: ${chainId}.`)

        return RPC_URLS_OFFICIAL[0]
    }
}
