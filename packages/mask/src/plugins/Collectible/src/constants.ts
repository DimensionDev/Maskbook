import { PluginID } from '@masknet/plugin-infra'
import { SourceType } from '@masknet/web3-shared-base'

export const PLUGIN_NAME = 'Collectibles'
export const PLUGIN_DESCRIPTION = 'An NFT collectible viewer.'

export const PLUGIN_ID = PluginID.Collectible
export const PLUGIN_META_KEY = `${PluginID.Collectible}:1`

export const OpenSeaMainnetURL = 'https://opensea.io'
export const OpenSeaTestnetURL = 'https://testnets.opensea.io'

export const RaribleUserURL = 'https://rarible.com/user/'
export const RaribleRopstenUserURL = 'https://ropsten.rarible.com/user/'
export const RaribleRinkebyUserURL = 'https://rinkeby.rarible.com/user/'

export const SUPPORTED_PROVIDERS = [
    SourceType.Gem,
    SourceType.NFTScan,
    SourceType.Rarible,
    SourceType.OpenSea,
    // SourceType.X2Y2,
    // SourceType.NFTScan,
    // SourceType.Zora,
    // SourceType.LooksRare,
]
