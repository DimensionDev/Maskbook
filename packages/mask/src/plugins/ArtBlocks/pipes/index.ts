import { ChainId, createLookupTableResolver } from '@masknet/web3-shared-evm'
import {
    ArtBlocksRopstenUrl,
    ArtBlocksMainnetUrl,
    ArtBlocksMainnetHostImageUrl,
    ArtBlocksRopstenHostImageUrl,
    ArtBlocksRopstenLiveUrl,
    ArtBlocksMainnetLiveUrl,
    ArtBlocksMainnetSubgraphLink,
    ArtBlocksRopstenSubgraphLink,
} from '../constants'

export const resolveLinkOnArtBlocks = createLookupTableResolver<ChainId.Mainnet | ChainId.Ropsten, string>(
    {
        [ChainId.Mainnet]: ArtBlocksMainnetUrl,
        [ChainId.Ropsten]: ArtBlocksRopstenUrl,
    },
    ArtBlocksMainnetUrl,
)

export const resolveImageLinkOnArtBlocks = createLookupTableResolver<ChainId.Mainnet | ChainId.Ropsten, string>(
    {
        [ChainId.Mainnet]: ArtBlocksMainnetHostImageUrl,
        [ChainId.Ropsten]: ArtBlocksRopstenHostImageUrl,
    },
    ArtBlocksMainnetHostImageUrl,
)

export const resolveLiveLinkOnArtBlocks = createLookupTableResolver<ChainId.Mainnet | ChainId.Ropsten, string>(
    {
        [ChainId.Mainnet]: ArtBlocksMainnetLiveUrl,
        [ChainId.Ropsten]: ArtBlocksRopstenLiveUrl,
    },
    ArtBlocksMainnetLiveUrl,
)

export const resolveSubgraphLinkOnArtBlocks = createLookupTableResolver<ChainId.Mainnet | ChainId.Ropsten, string>(
    {
        [ChainId.Mainnet]: ArtBlocksMainnetSubgraphLink,
        [ChainId.Ropsten]: ArtBlocksRopstenSubgraphLink,
    },
    ArtBlocksMainnetSubgraphLink,
)
