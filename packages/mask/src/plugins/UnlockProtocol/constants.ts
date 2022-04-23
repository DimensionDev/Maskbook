import { PluginId } from '@masknet/plugin-infra'
import { ChainId } from '@masknet/web3-shared-evm'

export const pluginName = 'Unlock Protocol'
export const pluginDescription = 'Post content behind a secure paywall'
export const pluginId = PluginId.UnlockProtocol
export const pluginMetaKey = `${pluginId}:1`

export const graphEndpointKeyVal = {
    [ChainId.Mainnet]: 'https://api.thegraph.com/subgraphs/name/unlock-protocol/unlock',
    [ChainId.Rinkeby]: 'https://api.thegraph.com/subgraphs/name/unlock-protocol/unlock-rinkeby',
    [ChainId.xDai]: 'https://api.thegraph.com/subgraphs/name/unlock-protocol/xdai',
    [ChainId.Matic]: 'https://api.thegraph.com/subgraphs/name/unlock-protocol/polygon',
    [ChainId.Avalanche]: '',
    [ChainId.Optimistic]: '',
}

export const keyServerEndpoint = 'https://unlock.r2d2.to/'

export const paywallUrl = 'https://app.unlock-protocol.com/checkout?paywallConfig='
