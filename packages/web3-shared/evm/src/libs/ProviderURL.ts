import { Flags } from '@masknet/flags'
import { getABTestSeed, joinsABTest } from '@masknet/shared-base'
import { getRPCConstants } from '../constants/constants.js'
import { ChainId } from '../types/index.js'

export class ProviderURL {
    /**
     * @deprecated Don't new ProviderEditor()
     * Use ProviderEditor.from(chainId) stead.
     */
    constructor() {}

    static from(chainId: ChainId) {
        const { RPC_URLS, RPC_WEIGHTS, RPC_BLOCKPI_URL } = getRPCConstants(chainId)

        // a grayscale user will be served the blockpi API
        if (chainId !== ChainId.Mainnet && RPC_BLOCKPI_URL && joinsABTest(Flags.blockpi_grayscale))
            return RPC_BLOCKPI_URL

        if (!RPC_URLS || !RPC_WEIGHTS) throw new Error(`No RPC presets at chainId: ${chainId}.`)

        return RPC_URLS[RPC_WEIGHTS[getABTestSeed() % RPC_URLS.length]]
    }

    static fromOfficial(chainId: ChainId) {
        const { RPC_URLS_OFFICIAL } = getRPCConstants(chainId)
        if (!RPC_URLS_OFFICIAL?.length) throw new Error(`No RPC presets at chainId: ${chainId}.`)
        return RPC_URLS_OFFICIAL[0]
    }
}
