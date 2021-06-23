export const PLUGIN_NAME = 'Collectibles'
export const PLUGIN_ICON = '🖼️'
export const PLUGIN_DESCRIPTION = 'An NFT collectible viewer.'
export const PLUGIN_IDENTIFIER = 'com.maskbook.collectibles'
export const PLUGIN_META_KEY = 'com.maskbook.collectibles:1'

export const openseaHostnames = ['opensea.io', 'testnets.opensea.io']
export const openseaPathnameRegexMatcher = /^\/assets\/(0x[0-9a-fA-F]{40})\/(\d+)/

export const raribleHostnames = ['rarible.com', 'app.rarible.com', 'ropsten.rarible.com']
export const rariblePathnameRegexMatcher = /^\/token\/(0x[0-9a-fA-F]{40})\:(\d+)/

export const OpenSeaAPI_Key = 'c38fe2446ee34f919436c32db480a2e3'
export const OpenSeaBaseURL = 'https://api.opensea.io/api/v1/'
export const OpenSeaRinkebyBaseURL = 'https://rinkeby-api.opensea.io/api/v1/'
export const OpenSeaGraphQLURL = 'https://opensea-agent.r2d2.to/graphql/'
export const OpenSeaAccountURL = 'https://opensea.io/accounts/'
export const OpenSeaTraitURL =
    '/assets/known-origin?search[stringTraits][0][name]=Tag&search[stringTraits][0][values][0]='
export const NullAddress = 'NullAddress'
export const NullContractAddress = '0x0000000000000000000000000000000000000000'
export const ReferrerAddress = ''

export const RaribleMainetURL = 'https://api-mainnet.rarible.com/'
export const RaribleRopstenURL = 'https://api-ropsten.rarible.com/'
export const RaribleIPFSURL = 'https://ipfs.rarible.com/ipfs/'
export const RaribleUserURL = 'https://rarible.com/user/'
export const RaribleRopstenUserURL = 'https://ropsten.rarible.com/user/'
