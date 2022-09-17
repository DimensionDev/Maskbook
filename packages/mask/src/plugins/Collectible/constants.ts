import { PluginID } from '@masknet/plugin-infra'
import { SourceType } from '@masknet/web3-shared-base'

export const PLUGIN_NAME = 'Collectibles'
export const PLUGIN_DESCRIPTION = 'An NFT collectible viewer.'
export const PLUGIN_WRAPPER_TITLE = 'NFT'

export const PLUGIN_ID = PluginID.Collectible
export const PLUGIN_META_KEY = `${PluginID.Collectible}:1`

export const openseaHostnames = ['opensea.io', 'testnets.opensea.io']
export const openseaPathnameRegexMatcher = /^\/assets\/(?:ethereum\/)?(0x[\dA-Fa-f]{40})\/(\d+)/
export const raribleHostnames = ['rarible.com', 'app.rarible.com', 'ropsten.rarible.com']
export const rariblePathnameRegexMatcher = /^\/token\/(0x[\dA-Fa-f]{40}):(\d+)/

export const zoraHostnames = ['zora.co']
export const zoraPathnameRegexMatcher = /^\/collections\/(0x[\dA-Fa-f]{40})\/(\d+)$/

export const NullAddress = 'NullAddress'
export const ReferrerAddress = ''
export const OpenSeaMainnetURL = 'https://opensea.io'
export const OpenSeaTestnetURL = 'https://testnets.opensea.io'

export const RaribleUserURL = 'https://rarible.com/user/'
export const RaribleRopstenUserURL = 'https://ropsten.rarible.com/user/'
export const RaribleRinkebyUserURL = 'https://rinkeby.rarible.com/user/'

export const SupportedProvider = [
    SourceType.Gem,
    SourceType.NFTScan,
    SourceType.Rarible,
    SourceType.OpenSea,
    // SourceType.X2Y2,
    // SourceType.NFTScan,
    // SourceType.Zora,
    // SourceType.LooksRare,
]
