import { PluginId } from '@masknet/plugin-infra'
import { ChainId } from '@masknet/web3-shared-evm'
export const PLUGIN_ID = PluginId.Web3Feed
export const PLUGIN_NAME = 'Web3 Feed'
export const PLUGIN_DESCRIPTION = 'web3 user collection feed'
export const ChainID = {
    ethereum: ChainId.Mainnet,
    polygon: ChainId.Matic,
    bnb: ChainId.BSC,
}
