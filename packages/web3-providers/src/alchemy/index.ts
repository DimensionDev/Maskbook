import {
    createIndicator,
    createNextIndicator,
    createPageable,
    HubOptions,
    NonFungibleAsset,
    NonFungibleToken,
    TokenType,
} from '@masknet/web3-shared-base'
import { ChainId as ChainId_EVM, SchemaType as SchemaType_EVM } from '@masknet/web3-shared-evm'
import { ChainId as ChainId_FLOW, SchemaType as SchemaType_FLOW } from '@masknet/web3-shared-flow'
import urlcat from 'urlcat'
import type { NonFungibleTokenAPI } from '..'
import { fetchJSON } from '../helpers'
import { Alchemy_EVM_NetworkMap, Alchemy_FLOW_NetworkMap, FILTER_WORDS } from './constants'
import type {
    AlchemyNFT_EVM,
    AlchemyNFT_FLOW,
    AlchemyResponse_EVM,
    AlchemyResponse_EVM_Contact_Metadata,
    AlchemyResponse_EVM_Metadata,
    AlchemyResponse_EVM_Owners,
    AlchemyResponse_FLOW,
    AlchemyResponse_FLOW_Metadata,
} from './types'

export * from './constants'
export class Alchemy_EVM_API implements NonFungibleTokenAPI.Provider<ChainId_EVM, SchemaType_EVM> {
    getTokens = async (from: string, { chainId = ChainId_EVM.Mainnet, indicator }: HubOptions<ChainId_EVM> = {}) => {
        const chainInfo = Alchemy_EVM_NetworkMap?.chains?.find((chain) => chain.chainId === chainId)

        const res = await fetchJSON<AlchemyResponse_EVM>(
            urlcat(`${chainInfo?.baseURL}${chainInfo?.API_KEY}/getNFTs/`, {
                owner: from,
                pageKey: indicator?.id && indicator.id !== '' ? indicator.id : undefined,
            }),
        )

        const assets = res?.ownedNfts?.map((nft) =>
            createNftToken_EVM((chainId as ChainId_EVM | undefined) ?? ChainId_EVM.Mainnet, nft),
        )
        return createPageable(assets, createIndicator(indicator), createNextIndicator(indicator, res?.pageKey ?? ''))
    }
    getAsset = async (
        address: string,
        tokenId: string,
        { chainId = ChainId_EVM.Mainnet }: HubOptions<ChainId_EVM> = {},
    ) => {
        const chainInfo = Alchemy_EVM_NetworkMap?.chains?.find((chain) => chain.chainId === chainId)

        const metaDataResponse = await fetchJSON<AlchemyResponse_EVM_Metadata>(
            urlcat(`${chainInfo?.baseURL}${chainInfo?.API_KEY}/getNFTMetadata/`, {
                contractAddress: address,
                tokenId,
                tokenType: 'ERC721',
            }),
        )
        const contractMetadataResponse = await fetchJSON<AlchemyResponse_EVM_Contact_Metadata>(
            urlcat(`${chainInfo?.baseURL}${chainInfo?.API_KEY}/getContractMetadata/`, {
                contractAddress: address,
            }),
        )
        const ownersResponse = await fetchJSON<AlchemyResponse_EVM_Owners>(
            urlcat(`${chainInfo?.baseURL}${chainInfo?.API_KEY}/getOwnersForToken/`, {
                contractAddress: address,
                tokenId,
            }),
        )

        if (!metaDataResponse) return
        return createNFTAsset_EVM(chainId, metaDataResponse, contractMetadataResponse, ownersResponse)
    }
}

export class Alchemy_FLOW_API implements NonFungibleTokenAPI.Provider<ChainId_FLOW, SchemaType_FLOW> {
    getTokens = async (from: string, opts?: HubOptions<ChainId_FLOW>) => {
        const chainInfo = Alchemy_FLOW_NetworkMap?.chains?.find((chain) => chain.chainId === opts?.chainId)
        const res = await fetchJSON<AlchemyResponse_FLOW>(
            urlcat(`${chainInfo?.baseURL}${chainInfo?.API_KEY}/getNFTs/`, {
                owner: from,
            }),
        )
        const assets = res?.nfts?.map((nft) =>
            createNftToken_FLOW((opts?.chainId as ChainId_FLOW | undefined) ?? ChainId_FLOW.Mainnet, nft),
        )
        return createPageable(assets, createIndicator(opts?.indicator))
    }
    getAsset = async (
        address: string,
        tokenId: string,
        { chainId = ChainId_FLOW.Mainnet }: HubOptions<ChainId_FLOW> = {},
        ownerAddress?: string,
        contractName?: string,
    ) => {
        if (!ownerAddress || !contractName) return
        const chainInfo = Alchemy_FLOW_NetworkMap?.chains?.find((chain) => chain.chainId === chainId)

        const metaDataResponse = await fetchJSON<AlchemyResponse_FLOW_Metadata>(
            urlcat(`${chainInfo?.baseURL}${chainInfo?.API_KEY}/getNFTMetadata/`, {
                owner: ownerAddress,
                contractName,
                contractAddress: address,
                tokenId,
            }),
        )

        if (!metaDataResponse) return
        return createNFTAsset_FLOW(chainId, ownerAddress, metaDataResponse)
    }
}

function createNftToken_EVM(
    chainId: ChainId_EVM,
    asset: AlchemyNFT_EVM,
): NonFungibleToken<ChainId_EVM, SchemaType_EVM> {
    return {
        id: asset.contract?.address,
        chainId,
        type: TokenType.NonFungible,
        schema: asset?.id?.tokenMetadata?.tokenType === 'ERC721' ? SchemaType_EVM.ERC721 : SchemaType_EVM.ERC1155,
        tokenId: Number.parseInt(asset.id?.tokenId, 16).toString(),
        address: asset.contract?.address,
        metadata: {
            chainId,
            name: asset?.metadata?.name ?? asset?.title,
            symbol: '',
            description: asset.description,
            imageURL: asset?.metadata?.image ?? asset?.media?.[0]?.gateway ?? '',
            mediaURL: asset?.media?.[0]?.gateway,
        },
        contract: {
            chainId,
            schema: asset?.id?.tokenMetadata?.tokenType === 'ERC721' ? SchemaType_EVM.ERC721 : SchemaType_EVM.ERC1155,
            address: asset?.contract?.address,
            name: asset?.metadata?.name ?? asset?.title,
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

function createNFTAsset_EVM(
    chainId: ChainId_EVM,
    metaDataResponse: AlchemyResponse_EVM_Metadata,
    contractMetadataResponse: AlchemyResponse_EVM_Contact_Metadata,
    ownersResponse: AlchemyResponse_EVM_Owners,
): NonFungibleAsset<ChainId_EVM, SchemaType_EVM> {
    return {
        id: metaDataResponse.contract?.address,
        chainId,
        type: TokenType.NonFungible,
        schema:
            metaDataResponse?.id?.tokenMetadata?.tokenType === 'ERC721'
                ? SchemaType_EVM.ERC721
                : SchemaType_EVM.ERC1155,
        tokenId: Number.parseInt(metaDataResponse.id?.tokenId, 16).toString(),
        address: metaDataResponse.contract?.address,
        metadata: {
            chainId,
            name: metaDataResponse?.metadata?.name ?? metaDataResponse?.title,
            symbol: '',
            description: metaDataResponse.description,
            imageURL: metaDataResponse?.metadata?.image ?? metaDataResponse?.media?.[0]?.gateway ?? '',
            mediaURL: metaDataResponse?.media?.[0]?.gateway,
        },
        contract: {
            chainId,
            schema:
                metaDataResponse?.id?.tokenMetadata?.tokenType === 'ERC721'
                    ? SchemaType_EVM.ERC721
                    : SchemaType_EVM.ERC1155,
            address: metaDataResponse?.contract?.address,
            name: metaDataResponse?.metadata?.name ?? metaDataResponse?.title,
            symbol: contractMetadataResponse?.contractMetadata?.symbol,
        },
        collection: {
            chainId,
            name: '',
            slug: '',
            description: metaDataResponse.description,
        },
        link: '',
        owner: {
            address: ownersResponse.owners?.[0],
        },
        traits: metaDataResponse.metadata?.attributes.map((x) => ({
            type: x.trait_type,
            value: x.value,
        })),
    }
}

function createNftToken_FLOW(
    chainId: ChainId_FLOW,
    asset: AlchemyNFT_FLOW,
): NonFungibleToken<ChainId_FLOW, SchemaType_FLOW> {
    return {
        id: asset.contract?.address,
        chainId,
        type: TokenType.NonFungible,
        schema: SchemaType_FLOW.NonFungible,
        tokenId: Number.parseInt(asset.id?.tokenId, 16).toString(),
        address: asset.contract?.address,
        metadata: {
            chainId,
            name: asset?.contract?.name ?? '',
            symbol: '',
            description: asset.description,
            imageURL: asset?.metadata?.metadata?.find((data) => data?.name === 'img')?.value,
            mediaURL: asset?.media?.uri,
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
    return {
        id: metaDataResponse.contract?.address,
        chainId,
        type: TokenType.NonFungible,
        schema: SchemaType_FLOW.NonFungible,
        tokenId: Number.parseInt(metaDataResponse.id?.tokenId, 16).toString(),
        address: metaDataResponse.contract?.address,
        metadata: {
            chainId,
            name: metaDataResponse?.contract?.name,
            symbol: '',
            description: metaDataResponse.description,
            imageURL: metaDataResponse?.metadata?.metadata?.find((data) => data?.name === 'img')?.value,
            mediaURL: metaDataResponse?.media?.uri,
        },
        contract: {
            chainId,
            schema: SchemaType_FLOW.NonFungible,
            address: metaDataResponse?.contract?.address,
            name: metaDataResponse?.contract?.name,
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
