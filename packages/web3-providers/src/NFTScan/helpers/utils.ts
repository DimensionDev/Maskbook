import { NetworkPluginID } from '@masknet/shared-base'
import type { Web3Helper } from '@masknet/web3-helpers'

import { ChainId } from '@masknet/web3-shared-evm'

export function resolveNFTScanHostName(pluginId: NetworkPluginID, chainId: Web3Helper.ChainIdAll) {
    if (pluginId === NetworkPluginID.PLUGIN_SOLANA) return 'https://solana.nftscan.com'

    switch (chainId) {
        case ChainId.Mainnet:
            return 'https://www.nftscan.com'
        case ChainId.Matic:
            return 'https://polygon.nftscan.com'
        case ChainId.BSC:
            return 'https://bnb.nftscan.com'
        case ChainId.Arbitrum:
            return 'https://arbitrum.nftscan.com'
        case ChainId.Avalanche:
            return 'https://avax.nftscan.com'
        case ChainId.Optimism:
            return 'https://optimism.nftscan.com'
        case ChainId.xDai:
            return 'https://cronos.nftscan.com'
        case ChainId.Moonbeam:
            return 'https://moonbeam.nftscan.com'
        default:
            return ''
    }
}
