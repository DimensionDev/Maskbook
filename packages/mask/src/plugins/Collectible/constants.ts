import { PluginId } from '@masknet/plugin-infra'

export const PLUGIN_NAME = 'Collectibles'
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
export const NullAddress = 'NullAddress'
export const ReferrerAddress = ''
export const OpenSeaMainnetURL = 'https://opensea.io'
export const OpenSeaTestnetURL = 'https://testnets.opensea.io'

export const RaribleUserURL = 'https://rarible.com/user/'
export const RaribleRopstenUserURL = 'https://ropsten.rarible.com/user/'
export const RaribleRinkebyUserURL = 'https://rinkeby.rarible.com/user/'
