import urlcat from 'urlcat'
import { first } from 'lodash-es'
import { createIndicator, createNextIndicator, createPageable } from '@masknet/shared-base'
import { type NonFungibleAsset, resolveResourceURL, SourceType, TokenType } from '@masknet/web3-shared-base'
import { ChainId, SchemaType, resolveImageURL } from '@masknet/web3-shared-evm'
import { Alchemy_EVM_NetworkMap } from '../constants.js'
import type {
    AlchemyNFT_EVM,
    AlchemyResponse_EVM,
    AlchemyResponse_EVM_Contact_Metadata,
    AlchemyResponse_EVM_Metadata,
    AlchemyResponse_EVM_Owners,
} from '../types.js'
import { formatAlchemyTokenId } from '../helpers.js'
import { fetchJSON } from '../../helpers/fetchJSON.js'
import { getAssetFullName } from '../../helpers/getAssetFullName.js'
import type { BaseHubOptions, NonFungibleTokenAPI } from '../../entry-types.js'

function createNonFungibleTokenLink(chainId: ChainId, address: string, tokenId: string) {
    if (chainId === ChainId.Polygon) {
        return urlcat('https://opensea.io/assets/matic/:address/:tokenId', {
            address,
            tokenId,
        })
    }
    return urlcat('https://opensea.io/assets/:address/:tokenId', {
        address,
        tokenId,
    })
}

function createNonFungibleToken(chainId: ChainId, asset: AlchemyNFT_EVM): NonFungibleAsset<ChainId, SchemaType> {
    const contractAddress = asset.contract.address
    const tokenId = formatAlchemyTokenId(asset.id.tokenId)
    const imageURL =
        asset.metadata.image || asset.metadata.image_url || asset.media?.[0]?.gateway || asset.metadata.animation_url
    const mediaURL =
        asset.media?.[0]?.gateway || asset.media?.[0]?.raw || asset.metadata.image_url || asset.metadata.image
    const name = getAssetFullName(
        asset.contract.address,
        asset.metadata.name || asset.title,
        asset.metadata.name || asset.title,
        tokenId,
    )
    return {
        id: `${contractAddress}_${tokenId}`,
        chainId,
        type: TokenType.NonFungible,
        schema: asset.id?.tokenMetadata?.tokenType === 'ERC721' ? SchemaType.ERC721 : SchemaType.ERC1155,
        tokenId,
        address: contractAddress,
        link: createNonFungibleTokenLink(chainId, contractAddress, tokenId),
        metadata: {
            chainId,
            name,
            description: asset.metadata.description || asset.description,
            imageURL: resolveImageURL(resolveResourceURL(decodeURIComponent(imageURL)), name, contractAddress),
            mediaURL: resolveResourceURL(decodeURIComponent(mediaURL)),
        },
        contract: {
            chainId,
            schema: asset.id?.tokenMetadata.tokenType === 'ERC721' ? SchemaType.ERC721 : SchemaType.ERC1155,
            address: contractAddress,
            name: asset.metadata.name || asset.title,
            symbol: '',
        },
        collection: {
            address: contractAddress,
            chainId,
            name: asset.metadata.name || asset.title,
            slug: '',
            description: asset.metadata.description || asset.description,
        },
        source: SourceType.Alchemy_EVM,
    }
}

function createNonFungibleAsset(
    chainId: ChainId,
    metaDataResponse: AlchemyResponse_EVM_Metadata,
    contractMetadataResponse?: AlchemyResponse_EVM_Contact_Metadata,
    ownersResponse?: AlchemyResponse_EVM_Owners,
): NonFungibleAsset<ChainId, SchemaType> {
    const tokenId = formatAlchemyTokenId(metaDataResponse.id.tokenId)
    const contractName = contractMetadataResponse?.contractMetadata.name || metaDataResponse.metadata?.name || ''
    const name = getAssetFullName(metaDataResponse.contract?.address, contractName, metaDataResponse.title, tokenId)
    return {
        id: `${metaDataResponse.contract.address}_${tokenId}`,
        chainId,
        type: TokenType.NonFungible,
        schema: metaDataResponse.id?.tokenMetadata?.tokenType === 'ERC721' ? SchemaType.ERC721 : SchemaType.ERC1155,
        tokenId,
        address: metaDataResponse.contract?.address,
        metadata: {
            chainId,
            name,
            symbol: contractMetadataResponse?.contractMetadata?.symbol ?? '',
            description: metaDataResponse.description,
            imageURL: resolveImageURL(
                decodeURIComponent(
                    metaDataResponse.metadata?.image ||
                        metaDataResponse.media?.[0]?.gateway ||
                        metaDataResponse.media?.[0]?.raw,
                ),
                name,
                metaDataResponse.contract?.address,
            ),
            mediaURL: decodeURIComponent(metaDataResponse.media?.[0]?.gateway),
        },
        contract: {
            chainId,
            schema: metaDataResponse.id?.tokenMetadata?.tokenType === 'ERC721' ? SchemaType.ERC721 : SchemaType.ERC1155,
            address: metaDataResponse.contract?.address,
            name: contractName,
            symbol: contractMetadataResponse?.contractMetadata?.symbol ?? '',
        },
        collection: {
            chainId,
            name: contractName,
            slug: contractMetadataResponse?.contractMetadata?.symbol || '',
            description: metaDataResponse.description,
        },
        link: createNonFungibleTokenLink(chainId, metaDataResponse.contract?.address, metaDataResponse.id?.tokenId),
        owner: {
            address: first(ownersResponse?.owners),
        },
        traits: metaDataResponse.metadata?.traits?.map((x) => ({
            type: x.trait_type,
            value: x.value,
        })),
        source: SourceType.Alchemy_EVM,
    }
}

class AlchemyEVM_API implements NonFungibleTokenAPI.Provider<ChainId, SchemaType, string> {
    async getAsset(address: string, tokenId: string, { chainId = ChainId.Mainnet }: BaseHubOptions<ChainId> = {}) {
        const chainInfo = Alchemy_EVM_NetworkMap.chains.find((chain) => chain.chainId === chainId)
        if (!chainInfo) return

        const allSettled = await Promise.allSettled([
            fetchJSON<AlchemyResponse_EVM_Metadata>(
                urlcat(`${chainInfo.baseURL}/getNFTMetadata`, {
                    contractAddress: address,
                    tokenId,
                    tokenType: 'ERC721',
                }),
            ),
            fetchJSON<AlchemyResponse_EVM_Contact_Metadata>(
                urlcat(`${chainInfo.contractMetadataURL}/getContractMetadata`, {
                    contractAddress: address,
                }),
            ),
            fetchJSON<AlchemyResponse_EVM_Owners>(
                urlcat(`${chainInfo.tokenOwnerURL}/getOwnersForToken`, {
                    contractAddress: address,
                    tokenId,
                }),
            ),
        ])

        const [metadataResponse, contractMetadataResponse, ownersResponse] = allSettled.map((x) =>
            x.status === 'fulfilled' ? x.value : undefined,
        ) as [
            AlchemyResponse_EVM_Metadata | undefined,
            AlchemyResponse_EVM_Contact_Metadata | undefined,
            AlchemyResponse_EVM_Owners | undefined,
        ]

        if (!metadataResponse || metadataResponse.error || !ownersResponse) return
        return createNonFungibleAsset(chainId, metadataResponse, contractMetadataResponse, ownersResponse)
    }

    async getAssets(from: string, { chainId = ChainId.Mainnet, indicator }: BaseHubOptions<ChainId> = {}) {
        const chainInfo = Alchemy_EVM_NetworkMap.chains.find((chain) => chain.chainId === chainId)
        if (!chainInfo) return createPageable([], createIndicator(indicator, ''))

        const response = await fetchJSON<AlchemyResponse_EVM>(
            urlcat(`${chainInfo.baseURL}/getNFTs/`, {
                owner: from,
                pageKey: typeof indicator?.index !== 'undefined' && indicator.index !== 0 ? indicator.id : undefined,
            }),
        )

        const assets = response.ownedNfts.map((nft) => createNonFungibleToken(chainId, nft))
        return createPageable(
            assets,
            createIndicator(indicator),
            response.pageKey ? createNextIndicator(indicator, response.pageKey) : undefined,
        )
    }
}
export const AlchemyEVM = new AlchemyEVM_API()
