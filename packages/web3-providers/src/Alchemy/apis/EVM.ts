import urlcat from 'urlcat'
import { first } from 'lodash-es'
import {
    createIndicator,
    createNextIndicator,
    createPageable,
    HubOptions,
    NonFungibleAsset,
    resolveResourceURL,
    SourceType,
    TokenType,
} from '@masknet/web3-shared-base'
import { ChainId, ChainId as ChainId_EVM, SchemaType as SchemaType_EVM } from '@masknet/web3-shared-evm'
import { Alchemy_EVM_NetworkMap } from '../constants.js'
import type {
    AlchemyNFT_EVM,
    AlchemyResponse_EVM,
    AlchemyResponse_EVM_Contact_Metadata,
    AlchemyResponse_EVM_Metadata,
    AlchemyResponse_EVM_Owners,
} from '../types.js'
import { formatAlchemyTokenId } from '../helpers.js'
import type { NonFungibleTokenAPI } from '../../entry-types.js'
import { fetchJSON, getAssetFullName } from '../../entry-helpers.js'

function createNonFungibleTokenLink(chainId: ChainId, address: string, tokenId: string) {
    if (chainId === ChainId.Matic) {
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

function createNonFungibleToken(
    chainId: ChainId_EVM,
    asset: AlchemyNFT_EVM,
): NonFungibleAsset<ChainId_EVM, SchemaType_EVM> {
    const contractAddress = asset.contract.address
    const tokenId = formatAlchemyTokenId(asset.id.tokenId)
    const imageURL =
        asset.metadata.image || asset.metadata.image_url || asset.media?.[0]?.gateway || asset.metadata.animation_url
    const mediaURL =
        asset.media?.[0]?.gateway || asset.media?.[0]?.raw || asset.metadata.image_url || asset.metadata.image
    return {
        id: `${contractAddress}_${tokenId}`,
        chainId,
        type: TokenType.NonFungible,
        schema: asset.id?.tokenMetadata?.tokenType === 'ERC721' ? SchemaType_EVM.ERC721 : SchemaType_EVM.ERC1155,
        tokenId,
        address: contractAddress,
        link: createNonFungibleTokenLink(chainId, contractAddress, tokenId),
        metadata: {
            chainId,
            name: getAssetFullName(
                asset.contract.address,
                asset.metadata.name || asset.title,
                asset.metadata.name || asset.title,
                tokenId,
            ),
            description: asset.metadata.description || asset.description,
            imageURL: resolveResourceURL(decodeURIComponent(imageURL)),
            mediaURL: resolveResourceURL(decodeURIComponent(mediaURL)),
        },
        contract: {
            chainId,
            schema: asset.id?.tokenMetadata.tokenType === 'ERC721' ? SchemaType_EVM.ERC721 : SchemaType_EVM.ERC1155,
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
    chainId: ChainId_EVM,
    metaDataResponse: AlchemyResponse_EVM_Metadata,
    contractMetadataResponse?: AlchemyResponse_EVM_Contact_Metadata,
    ownersResponse?: AlchemyResponse_EVM_Owners,
): NonFungibleAsset<ChainId_EVM, SchemaType_EVM> {
    const tokenId = formatAlchemyTokenId(metaDataResponse.id.tokenId)
    const contractName = contractMetadataResponse?.contractMetadata.name || metaDataResponse.metadata?.name || ''

    return {
        id: `${metaDataResponse.contract.address}_${tokenId}`,
        chainId,
        type: TokenType.NonFungible,
        schema:
            metaDataResponse.id?.tokenMetadata?.tokenType === 'ERC721' ? SchemaType_EVM.ERC721 : SchemaType_EVM.ERC1155,
        tokenId,
        address: metaDataResponse.contract?.address,
        metadata: {
            chainId,
            name: getAssetFullName(metaDataResponse.contract?.address, contractName, metaDataResponse.title, tokenId),
            symbol: contractMetadataResponse?.contractMetadata?.symbol ?? '',
            description: metaDataResponse.description,
            imageURL: decodeURIComponent(
                metaDataResponse.metadata?.image ||
                    metaDataResponse.media?.[0]?.gateway ||
                    metaDataResponse.media?.[0]?.raw,
            ),
            mediaURL: decodeURIComponent(metaDataResponse.media?.[0]?.gateway),
        },
        contract: {
            chainId,
            schema:
                metaDataResponse.id?.tokenMetadata?.tokenType === 'ERC721'
                    ? SchemaType_EVM.ERC721
                    : SchemaType_EVM.ERC1155,
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

export class AlchemyEVM_API implements NonFungibleTokenAPI.Provider<ChainId_EVM, SchemaType_EVM, string> {
    async getAsset(address: string, tokenId: string, { chainId = ChainId_EVM.Mainnet }: HubOptions<ChainId_EVM> = {}) {
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

        if (!metadataResponse) return
        return createNonFungibleAsset(chainId, metadataResponse, contractMetadataResponse, ownersResponse)
    }

    async getAssets(from: string, { chainId = ChainId_EVM.Mainnet, indicator }: HubOptions<ChainId_EVM> = {}) {
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
