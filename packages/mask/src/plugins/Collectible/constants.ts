import { PluginID } from '@masknet/plugin-infra'
import { SourceType } from '@masknet/web3-shared-base'

export const PLUGIN_NAME = 'Collectibles'
export const PLUGIN_DESCRIPTION = 'An NFT collectible viewer.'
export const PLUGIN_WRAPPER_TITLE = 'NFT'

export const PLUGIN_ID = PluginID.Collectible
export const PLUGIN_META_KEY = `${PluginID.Collectible}:1`

export const openseaHostnames = ['opensea.io', 'testnets.opensea.io']
export const openseaPathnameRegexMatcher = /^\/assets\/(?:ethereum|matic|solana)\/(0x[\dA-Fa-f]{40}|\w{44})\/?(\d+)?/
export const raribleHostnames = ['rarible.com', 'app.rarible.com', 'ropsten.rarible.com']
export const rariblePathnameRegexMatcher = /^\/token\/(?:ethereum|solana|polygon)?\/?(\w+):?(\d+)?/

export const zoraHostnames = ['zora.co', 'market.zora.co']
export const zoraPathnameRegexMatcher = /^\/collections\/(zora|0x[\dA-Fa-f]{40})\/(\d+)$/

export const ZORA_COLLECTION_ADDRESS = '0xabEFBc9fD2F806065b4f3C237d4b59D9A97Bcac7'

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
