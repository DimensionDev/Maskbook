import urlcat from 'urlcat'
import { createIndicator, createPageable, HubOptions, NonFungibleAsset, TokenType } from '@masknet/web3-shared-base'
import { resolveAR } from '@masknet/web3-shared-evm'
import { ChainId, SchemaType } from '@masknet/web3-shared-flow'
import type { NonFungibleTokenAPI } from '../../types'
import { fetchJSON } from '../../helpers'
import { Alchemy_FLOW_NetworkMap, FILTER_WORDS } from '../constants'
import type { AlchemyNFT_FLOW, AlchemyResponse_FLOW, AlchemyResponse_FLOW_Metadata } from '../types'
import { formatAlchemyTokenId } from '../helpers'

function createNonFungibleTokenImageURL(asset: AlchemyNFT_FLOW | AlchemyResponse_FLOW_Metadata) {
    return (
        asset?.metadata?.metadata?.find((data) => data?.name === 'img')?.value ||
        asset?.metadata?.metadata?.find((data) => data?.name === 'eventImage')?.value ||
        asset?.metadata?.metadata?.find((data) => data?.name === 'ipfsLink')?.value ||
        asset?.media?.find((data) => data?.mimeType === 'image/png | image')?.uri ||
        resolveAR(asset?.metadata?.metadata?.find((data) => data?.name === 'arLink')?.value || '')
    )
}

function createNonFungibleToken(chainId: ChainId, asset: AlchemyNFT_FLOW): NonFungibleAsset<ChainId, SchemaType> {
    const tokenId = formatAlchemyTokenId(asset.id.tokenId)
    return {
        id: `${asset.contract.address}_${tokenId}`,
        chainId,
        type: TokenType.NonFungible,
        schema: SchemaType.NonFungible,
        tokenId,
        address: asset.contract.address,
        metadata: {
            chainId,
            name: asset?.contract?.name ?? '',
            symbol: '',
            description: asset.description,
            imageURL: createNonFungibleTokenImageURL(asset),
            mediaURL: asset?.media?.find((data) => data?.mimeType === 'image/png | image')?.uri,
        },
        contract: {
            chainId,
            schema: SchemaType.NonFungible,
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

function createNonFungibleAsset(
    chainId: ChainId,
    ownerAddress: string,
    metaDataResponse: AlchemyResponse_FLOW_Metadata,
): NonFungibleAsset<ChainId, SchemaType> {
    const tokenId = formatAlchemyTokenId(metaDataResponse.id.tokenId)
    return {
        id: `${metaDataResponse.contract.address}_${tokenId}`,
        chainId,
        type: TokenType.NonFungible,
        schema: SchemaType.NonFungible,
        tokenId,
        address: metaDataResponse.contract.address,
        metadata: {
            chainId,
            name: metaDataResponse.contract?.name,
            symbol: '',
            description: metaDataResponse.description,
            imageURL: createNonFungibleTokenImageURL(metaDataResponse),
            mediaURL: metaDataResponse.media?.find((data) => data?.mimeType === 'image/png | image')?.uri,
        },
        contract: {
            chainId,
            schema: SchemaType.NonFungible,
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

export class AlchemyFlowAPI implements NonFungibleTokenAPI.Provider<ChainId, SchemaType> {
    async getAsset(
        address: string,
        tokenId: string,
        { chainId = ChainId.Mainnet }: HubOptions<ChainId> = {},
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
        return createNonFungibleAsset(chainId, ownerAddress, metaDataResponse)
    }

    async getAssets(from: string, { chainId, indicator }: HubOptions<ChainId> = {}) {
        const chainInfo = Alchemy_FLOW_NetworkMap?.chains?.find((chain) => chain.chainId === chainId)
        const res = await fetchJSON<AlchemyResponse_FLOW>(
            urlcat(`${chainInfo?.baseURL}/getNFTs/`, {
                owner: from,
                pageKey: typeof indicator?.index !== 'undefined' && indicator.index !== 0 ? indicator.id : undefined,
            }),
        )
        const assets = res?.nfts?.map((nft) =>
            createNonFungibleToken((chainId as ChainId | undefined) ?? ChainId.Mainnet, nft),
        )
        return createPageable(assets, createIndicator(indicator))
    }
}
