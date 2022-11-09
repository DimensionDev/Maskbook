import urlcat from 'urlcat'
import { ChainId } from '@masknet/web3-shared-evm'
import { createLookupTableResolver } from '@masknet/shared-base'
import {
    ArtBlocksRopstenUrl,
    ArtBlocksMainnetUrl,
    ArtBlocksMainnetHostImageUrl,
    ArtBlocksRopstenHostImageUrl,
    ArtBlocksMainnetSubgraphLink,
    ArtBlocksRopstenSubgraphLink,
} from '../constants.js'

export const resolveTokenLinkOnArtBlocks = (chainId: ChainId, tokenId: number) => {
    if (chainId === ChainId.Ropsten) {
        return urlcat(ArtBlocksRopstenUrl, '/token/:tokenId', { tokenId })
    }

    return urlcat(ArtBlocksMainnetUrl, '/token/:tokenId', { tokenId })
}

export const resolveProjectLinkOnArtBlocks = (chainId: ChainId, projectId: string) => {
    if (chainId === ChainId.Ropsten) {
        return urlcat(ArtBlocksRopstenUrl, '/project/:projectId', { projectId })
    }

    return urlcat(ArtBlocksMainnetUrl, '/project/:projectId', { projectId })
}

export const resolveUserLinkOnArtBlocks = (chainId: ChainId, address: string) => {
    if (chainId === ChainId.Ropsten) {
        return urlcat(ArtBlocksRopstenUrl, '/user/:address', { address })
    }

    return urlcat(ArtBlocksMainnetUrl, '/user/:address', { address })
}

export const resolveImageLinkOnArtBlocks = (chainId: ChainId, tokenImage: string) => {
    if (chainId === ChainId.Ropsten) {
        return urlcat(ArtBlocksRopstenHostImageUrl, '/:tokenImage', { tokenImage })
    }

    return urlcat(ArtBlocksMainnetHostImageUrl, '/:tokenImage', { tokenImage })
}

export const resolveSubgraphLinkOnArtBlocks = createLookupTableResolver<ChainId.Mainnet | ChainId.Ropsten, string>(
    {
        [ChainId.Mainnet]: ArtBlocksMainnetSubgraphLink,
        [ChainId.Ropsten]: ArtBlocksRopstenSubgraphLink,
    },
    ArtBlocksMainnetSubgraphLink,
)
