import { PluginID } from '@masknet/shared-base'
import { ChainId } from '@masknet/web3-shared-evm'

export const PLUGIN_NAME = 'Unlock Protocol'
export const PLUGIN_DESCRIPTION = 'Post content behind a secure paywall'
export const PLUGIN_ID = PluginID.UnlockProtocol
export const PLUGIN_META_KEY = `${PLUGIN_ID}:1`

export const graphEndpointKeyVal = {
    [ChainId.Mainnet]: 'https://api.thegraph.com/subgraphs/name/unlock-protocol/unlock',
    [ChainId.Rinkeby]: 'https://api.thegraph.com/subgraphs/name/unlock-protocol/unlock-rinkeby',
    [ChainId.xDai]: 'https://api.thegraph.com/subgraphs/name/unlock-protocol/xdai',
    [ChainId.Matic]: 'https://api.thegraph.com/subgraphs/name/unlock-protocol/polygon',
    [ChainId.Avalanche]: '',
    [ChainId.Optimism]: '',
}

export const keyServerEndpoint = 'https://unlock.r2d2.to/'

export const paywallUrl = 'https://app.unlock-protocol.com/checkout?paywallConfig='
