import { PluginID } from '@masknet/shared-base'

export const ARTBLOCKS_PLUGIN_ID = PluginID.ArtBlocks
export const PLUGIN_NAME = 'ArtBlocks'
const TESTNET_HOSTNAME = 'artist-staging.artblocks.io'
const MAINNET_HOSTNAME = 'www.artblocks.io'
export const artBlocksHostnames = [TESTNET_HOSTNAME, MAINNET_HOSTNAME]
export const artBlocksPathnameRegex = /^\/project\/(\d+)|^\/collections\/.*?\/projects\/0x.{40}\/(\d+)/
export const ArtBlocksLogoUrl = 'https://www.artblocks.io/_next/image?url=%2Fsquig.png&w=48&q=75'

export const ArtBlocksMainnetSubgraphLink = 'https://api.thegraph.com/subgraphs/name/artblocks/art-blocks'
export const ArtBlocksRopstenSubgraphLink =
    'https://api.thegraph.com/subgraphs/name/artblocks/art-blocks-artist-staging'

export const ArtBlocksRopstenUrl = 'https://artist-staging.artblocks.io'
export const ArtBlocksMainnetUrl = 'https://artblocks.io'
export const URL_PATTERN = /https:\/\/(www.artblocks.io|artist-staging.artblocks.io)\/project\/(\d+)/
export const ArtBlocksMainnetHostImageUrl = 'https://artblocks-mainnet.s3.amazonaws.com'
export const ArtBlocksRopstenHostImageUrl = 'https://artblocks-artists-staging.s3.amazonaws.com'
