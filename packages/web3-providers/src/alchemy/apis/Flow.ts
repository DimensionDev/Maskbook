import urlcat from 'urlcat'
import {
    createIndicator,
    createPageable,
    HubOptions,
    NonFungibleAsset,
    TokenType,
} from '@masknet/web3-shared-base'
import {
    ChainId as ChainId_EVM,
    resolveAR,
    resolveIPFS,
    resolveIPFSLinkFromURL,
    resolveOpenSeaLink,
    SchemaType as SchemaType_EVM,
} from '@masknet/web3-shared-evm'
import { ChainId as ChainId_FLOW, SchemaType as SchemaType_FLOW } from '@masknet/web3-shared-flow'
import type { NonFungibleTokenAPI } from '../../types'
import { fetchJSON } from '../../helpers'
import {  Alchemy_FLOW_NetworkMap, FILTER_WORDS } from '../constants'
import type {
    AlchemyNFT_EVM,
    AlchemyNFT_FLOW,
    AlchemyResponse_FLOW,
    AlchemyResponse_FLOW_Metadata,
} from '../types'
import { formatAlchemyTokenId } from '../helpers'

function createNftToken_FLOW(
    chainId: ChainId_FLOW,
    asset: AlchemyNFT_FLOW,
): NonFungibleAsset<ChainId_FLOW, SchemaType_FLOW> {
    const tokenId = formatAlchemyTokenId(asset.id.tokenId)
    return {
        id: `${asset.contract.address}_${tokenId}`,
        chainId,
        type: TokenType.NonFungible,
        schema: SchemaType_FLOW.NonFungible,
        tokenId,
        address: asset.contract.address,
        metadata: {
            chainId,
            name: asset?.contract?.name ?? '',
            symbol: '',
            description: asset.description,
            imageURL:
                resolveIPFS(
                    asset?.metadata?.metadata?.find((data) => data?.name === 'img')?.value ||
                        asset?.metadata?.metadata?.find((data) => data?.name === 'eventImage')?.value ||
                        asset?.metadata?.metadata?.find((data) => data?.name === 'ipfsLink')?.value ||
                        asset?.media?.find((data) => data?.mimeType === 'image/png | image')?.uri ||
                        '',
                ) || resolveAR(asset?.metadata?.metadata?.find((data) => data?.name === 'arLink')?.value || ''),
            mediaURL: resolveIPFS(asset?.media?.find((data) => data?.mimeType === 'image/png | image')?.uri || ''),
        },
        contract: {
            chainId,
            schema: SchemaType_FLOW.NonFungible,
            address: asset?.contract?.address,
            name: asset?.contract?.name ?? '',
            symbol: '',
        },
        collection: {
            chainId,
            name: '',
            slug: '',
            description: asset.description,
        },
    }
}

function createNFTAsset_FLOW(
    chainId: ChainId_FLOW,
    ownerAddress: string,
    metaDataResponse: AlchemyResponse_FLOW_Metadata,
): NonFungibleAsset<ChainId_FLOW, SchemaType_FLOW> {
    const tokenId = formatAlchemyTokenId(metaDataResponse.id.tokenId)
    return {
        id: `${metaDataResponse.contract.address}_${tokenId}`,
        chainId,
        type: TokenType.NonFungible,
        schema: SchemaType_FLOW.NonFungible,
        tokenId,
        address: metaDataResponse.contract.address,
        metadata: {
            chainId,
            name: metaDataResponse.contract?.name,
            symbol: '',
            description: metaDataResponse.description,
            imageURL:
                resolveIPFS(
                    metaDataResponse.metadata?.metadata?.find((data) => data?.name === 'img')?.value ||
                        metaDataResponse.metadata?.metadata?.find((data) => data?.name === 'eventImage')?.value ||
                        metaDataResponse.metadata?.metadata?.find((data) => data?.name === 'ipfsLink')?.value ||
                        metaDataResponse.media?.find((data) => data?.mimeType === 'image/png | image')?.uri ||
                        '',
                ) ||
                resolveAR(metaDataResponse.metadata?.metadata?.find((data) => data?.name === 'arLink')?.value || ''),
            mediaURL: resolveIPFS(
                metaDataResponse.media?.find((data) => data?.mimeType === 'image/png | image')?.uri || '',
            ),
        },
        contract: {
            chainId,
            schema: SchemaType_FLOW.NonFungible,
            address: metaDataResponse.contract?.address,
            name: metaDataResponse.contract?.name,
            symbol: '',
        },
        collection: {
            chainId,
            name: '',
            slug: '',
            description: metaDataResponse.description,
        },
        link: '',
        owner: {
            address: ownerAddress,
        },
        traits: metaDataResponse.metadata?.metadata
            .map((x) => ({
                type: x.name,
                value: x.value,
            }))
            ?.filter((trait) => FILTER_WORDS?.findIndex((name) => name === trait.type) === -1),
    }
}


export class Alchemy_FLOW_API implements NonFungibleTokenAPI.Provider<ChainId_FLOW, SchemaType_FLOW> {
    async getAsset(
        address: string,
        tokenId: string,
        { chainId = ChainId_FLOW.Mainnet }: HubOptions<ChainId_FLOW> = {},
        ownerAddress?: string,
        contractName?: string,
    ) {
        if (!ownerAddress || !contractName) return
        const chainInfo = Alchemy_FLOW_NetworkMap?.chains?.find((chain) => chain.chainId === chainId)

        const metaDataResponse = await fetchJSON<AlchemyResponse_FLOW_Metadata>(
            urlcat(`${chainInfo?.baseURL}/getNFTMetadata/`, {
                owner: ownerAddress,
                contractName,
                contractAddress: address,
                tokenId,
            }),
        )

        if (!metaDataResponse) return
        return createNFTAsset_FLOW(chainId, ownerAddress, metaDataResponse)
    }

    async getAssets(from: string, { chainId, indicator }: HubOptions<ChainId_FLOW> = {}) {
        const chainInfo = Alchemy_FLOW_NetworkMap?.chains?.find((chain) => chain.chainId === chainId)
        const res = await fetchJSON<AlchemyResponse_FLOW>(
            urlcat(`${chainInfo?.baseURL}/getNFTs/`, {
                owner: from,
                pageKey: typeof indicator?.index !== 'undefined' && indicator.index !== 0 ? indicator.id : undefined,
            }),
        )
        const assets = res?.nfts?.map((nft) =>
            createNftToken_FLOW((chainId as ChainId_FLOW | undefined) ?? ChainId_FLOW.Mainnet, nft),
        )
        return createPageable(assets, createIndicator(indicator))
    }
}

function createNftToken_EVM(
    chainId: ChainId_EVM,
    asset: AlchemyNFT_EVM,
): NonFungibleAsset<ChainId_EVM, SchemaType_EVM> {
    const contractAddress = asset.contract.address
    const tokenId = formatAlchemyTokenId(asset.id.tokenId)
    return {
        id: `${contractAddress}_${tokenId}`,
        chainId,
        type: TokenType.NonFungible,
        schema: asset.id?.tokenMetadata?.tokenType === 'ERC721' ? SchemaType_EVM.ERC721 : SchemaType_EVM.ERC1155,
        tokenId,
        address: contractAddress,
        link: resolveOpenSeaLink(contractAddress, tokenId, chainId),
        metadata: {
            chainId,
            name: asset.metadata.name ?? asset.title,
            description: asset.metadata.description || asset.description,
            imageURL: resolveIPFSLinkFromURL(
                asset.metadata.image ||
                    asset.metadata.image_url ||
                    asset.media?.[0]?.gateway ||
                    asset.metadata.animation_url ||
                    '',
            ),
            mediaURL: resolveIPFSLinkFromURL(
                asset.media?.[0]?.gateway ?? asset.media?.[0]?.raw ?? asset.metadata.image_url ?? asset.metadata.image,
            ),
        },
        contract: {
            chainId,
            schema: asset.id?.tokenMetadata.tokenType === 'ERC721' ? SchemaType_EVM.ERC721 : SchemaType_EVM.ERC1155,
            address: contractAddress,
            name: asset.metadata.name ?? asset.title,
            symbol: '',
        },
        collection: {
            address: contractAddress,
            chainId,
            name: asset.metadata.name || asset.title,
            slug: '',
            description: asset.metadata.description || asset.description,
        },
    }
}
