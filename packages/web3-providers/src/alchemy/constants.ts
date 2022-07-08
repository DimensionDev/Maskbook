import { NetworkPluginID } from '@masknet/web3-shared-base'
import { ChainId as ChainId_EVM } from '@masknet/web3-shared-evm'
import { ChainId as ChainId_FLOW } from '@masknet/web3-shared-flow'
export const Alchemy_EVM_NetworkMap = {
    network: NetworkPluginID.PLUGIN_EVM,
    chains: [
        {
            chainId: ChainId_EVM.Mainnet,
            baseURL: 'https://eth-mainnet.alchemyapi.io/v2',
            contractMetadataURL: 'https://eth-mainnet.g.alchemy.com/nft/v2',
            tokenOwnerURL: 'https://eth-mainnet.g.alchemy.com/nft/v2',
        },
        {
            chainId: ChainId_EVM.Matic,
            baseURL: 'https://polygon-mainnet.g.alchemy.com/v2',
        },
    ],
}

export const Alchemy_FLOW_NetworkMap = {
    network: NetworkPluginID.PLUGIN_FLOW,
    chains: [
        {
            chainId: ChainId_FLOW.Mainnet,
            baseURL: 'https://flow-mainnet.g.alchemy.com/v2',
        },
    ],
}

export const FILTER_WORDS = ['description', 'id', 'title', 'number', 'img', 'uri']
