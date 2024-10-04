import { NetworkPluginID } from '@masknet/shared-base'
import { ChainId } from '@masknet/web3-shared-evm'

export const TRADER_WEB3_CONFIG = {
    [NetworkPluginID.PLUGIN_EVM]: {
        supportedChainIds: [
            ChainId.Mainnet,
            ChainId.BSC,
            ChainId.Polygon,
            ChainId.Arbitrum,
            ChainId.xDai,
            ChainId.Aurora,
            ChainId.Avalanche,
            ChainId.Fantom,
            ChainId.Astar,
            ChainId.Optimism,
            ChainId.Base,
            ChainId.Scroll,
            ChainId.Aurora,
            ChainId.Metis,
        ],
    },
    [NetworkPluginID.PLUGIN_FLOW]: { supportedChainIds: [] },
    [NetworkPluginID.PLUGIN_SOLANA]: { supportedChainIds: [] },
}
