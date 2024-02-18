import { NetworkPluginID } from '@masknet/shared-base'
import { ChainId } from '@masknet/web3-shared-evm'

export const TRADER_WEB3_CONFIG = {
    [NetworkPluginID.PLUGIN_EVM]: {
        supportedChainIds: [
            ChainId.Mainnet,
            ChainId.BSC,
            ChainId.Matic,
            ChainId.Arbitrum,
            ChainId.xDai,
            ChainId.Aurora,
            ChainId.Avalanche,
            ChainId.Fantom,
            ChainId.Astar,
            ChainId.Optimism,
        ],
    },
    [NetworkPluginID.PLUGIN_FLOW]: { supportedChainIds: [] },
    [NetworkPluginID.PLUGIN_SOLANA]: { supportedChainIds: [] },
}
