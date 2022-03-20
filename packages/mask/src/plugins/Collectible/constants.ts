import { PluginId } from '@masknet/plugin-infra'

export const PLUGIN_NAME = 'Collectibles'
export const PLUGIN_ICON = '\u{1F5BC}\uFE0F'
export const PLUGIN_DESCRIPTION = 'An NFT collectible viewer.'
export const PLUGIN_ID = PluginId.Collectible
export const PLUGIN_META_KEY = `${PluginId.Collectible}:1`

export const openseaHostnames = ['opensea.io', 'testnets.opensea.io']
export const openseaPathnameRegexMatcher = /^\/assets\/(0x[\dA-Fa-f]{40})\/(\d+)/

export const raribleHostnames = ['rarible.com', 'app.rarible.com', 'ropsten.rarible.com']
export const rariblePathnameRegexMatcher = /^\/token\/(0x[\dA-Fa-f]{40}):(\d+)/

export const zoraHostnames = ['zora.co']
export const zoraPathnameRegexMatcher = /^\/collections\/(0x[\dA-Fa-f]{40})\/(\d+)$/

export const OpenSeaAPI_Key = 'c38fe2446ee34f919436c32db480a2e3'
export const OpenSeaBaseURL = 'https://api.opensea.io/api/v1/'
export const OpenSeaRinkebyBaseURL = 'https://rinkeby-api.opensea.io/api/v1/'
export const OpenSeaGraphQLURL = 'https://opensea-agent.r2d2.to/graphql/'
export const OpenSeaAccountURL = 'https://opensea.io/accounts/'
export const OpenSeaTraitURL =
    '/assets/known-origin?search[stringTraits][0][name]=Tag&search[stringTraits][0][values][0]='
export const NullAddress = 'NullAddress'
export const ReferrerAddress = ''
export const OpenSeaMainnetURL = 'https://opensea.io'
export const OpenSeaTestnetURL = 'https://testnets.opensea.io'

export const RaribleURL = 'https://api.rarible.com/'
export const RaribleChainURL = 'https://ethereum-api.rarible.org/'
export const RaribleUserURL = 'https://rarible.com/user/'
export const RaribleRopstenUserURL = 'https://ropsten.rarible.com/user/'
export const RaribleRinkebyUserURL = 'https://rinkeby.rarible.com/user/'
export const RaribleMainnetURL = 'https://api-mainnet.rarible.com/marketplace/api/v4/'
