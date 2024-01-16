import urlcat from 'urlcat'
import { createIndicator, createPageable } from '@masknet/shared-base'
import { resolveArweaveURL, type NonFungibleAsset, TokenType, SourceType } from '@masknet/web3-shared-base'
import { ChainId, getContractAddress, SchemaType, isValidChainId } from '@masknet/web3-shared-flow'
import { Alchemy_FLOW_NetworkMap, FILTER_WORDS } from '../constants.js'
import type { AlchemyNFT_Flow, AlchemyResponse_Flow, AlchemyResponse_Flow_Metadata } from '../types.js'
import { formatAlchemyTokenId, formatAlchemyTokenAddress } from '../helpers.js'
import { fetchJSON } from '../../helpers/fetchJSON.js'
import { getAssetFullName } from '../../helpers/getAssetFullName.js'
import type { BaseHubOptions, NonFungibleTokenAPI } from '../../entry-types.js'

function createNonFungibleTokenImageURL(asset: AlchemyNFT_Flow | AlchemyResponse_Flow_Metadata) {
    return (
        asset.metadata.metadata.find((data) => data.name === 'img')?.value ||
        asset.metadata.metadata.find((data) => data.name === 'eventImage')?.value ||
        asset.metadata.metadata.find((data) => data.name === 'ipfsLink')?.value ||
        asset.media.find((data) => data.mimeType === 'image/png | image')?.uri ||
        resolveArweaveURL(asset.metadata.metadata.find((data) => data.name === 'arLink')?.value || '')
    )
}

function createNonFungibleToken(chainId: ChainId, asset: AlchemyNFT_Flow): NonFungibleAsset<ChainId, SchemaType> {
    const tokenId = formatAlchemyTokenId(asset.id.tokenId)
    const address = formatAlchemyTokenAddress(asset.contract.address, asset.contract.name)
    return {
        id: `${asset.contract.address}_${tokenId}`,
        chainId,
        type: TokenType.NonFungible,
        schema: SchemaType.NonFungible,
        tokenId,
        address,
        metadata: {
            chainId,
            name: getAssetFullName(address, asset.contract.name ?? '', asset.contract.name, tokenId),
            symbol: '',
            description: asset.description,
            imageURL: createNonFungibleTokenImageURL(asset),
            mediaURL: asset.media.find((data) => data.mimeType === 'image/png | image')?.uri,
        },
        contract: {
            chainId,
            schema: SchemaType.NonFungible,
            address,
            name: asset.contract.name ?? '',
            symbol: '',
        },
        source: SourceType.Alchemy_FLOW,
    }
}

function createNonFungibleAsset(
    chainId: ChainId,
    ownerAddress: string,
    metadata: AlchemyResponse_Flow_Metadata,
): NonFungibleAsset<ChainId, SchemaType> {
    const tokenId = formatAlchemyTokenId(metadata.id.tokenId)
    const address = formatAlchemyTokenAddress(metadata.contract.address, metadata.contract.name)
    return {
        id: `${metadata.contract.address}_${tokenId}`,
        chainId,
        type: TokenType.NonFungible,
        schema: SchemaType.NonFungible,
        tokenId,
        address,
        metadata: {
            chainId,
            name: getAssetFullName(address, metadata.contract.name ?? '', metadata.contract.name, tokenId),
            symbol: '',
            description: metadata.description,
            imageURL: createNonFungibleTokenImageURL(metadata),
            mediaURL: metadata.media.find((data) => data.mimeType === 'image/png | image')?.uri,
        },
        contract: {
            chainId,
            schema: SchemaType.NonFungible,
            address,
            name: metadata.contract.name,
            symbol: '',
        },
        collection: {
            chainId,
            name: '',
            slug: '',
            description: metadata.description,
        },
        link: '',
        owner: {
            address: ownerAddress,
        },
        traits: metadata.metadata.metadata
            .map((x) => ({
                type: x.name,
                value: x.value,
            }))
            .filter((trait) => !FILTER_WORDS.includes(trait.type)),
        source: SourceType.Alchemy_FLOW,
    }
}

class AlchemyFlowAPI implements NonFungibleTokenAPI.Provider<ChainId, SchemaType> {
    async getAsset(
        address: string,
        tokenId: string,
        { account, chainId = ChainId.Mainnet }: BaseHubOptions<ChainId> = {},
    ) {
        const { address: contractAddress, identifier: contractName } = getContractAddress(address) ?? {}
        if (!account || !contractAddress || !contractName || !isValidChainId(chainId)) return
        const chainInfo = Alchemy_FLOW_NetworkMap.chains.find((chain) => chain.chainId === chainId)
        const metadata = await fetchJSON<AlchemyResponse_Flow_Metadata>(
            urlcat(`${chainInfo?.baseURL}/getNFTMetadata/`, {
                owner: account,
                contractAddress,
                contractName,
                tokenId,
            }),
        )

        if (!metadata) return
        return createNonFungibleAsset(chainId, account, metadata)
    }

    async getAssets(from: string, { chainId, indicator }: BaseHubOptions<ChainId> = {}) {
        if (!from || !isValidChainId(chainId)) return createPageable([], createIndicator(indicator))
        const chainInfo = Alchemy_FLOW_NetworkMap.chains.find((chain) => chain.chainId === chainId)
        const res = await fetchJSON<AlchemyResponse_Flow>(
            urlcat(`${chainInfo?.baseURL}/getNFTs/`, {
                owner: from,
                pageKey: typeof indicator?.index !== 'undefined' && indicator.index !== 0 ? indicator.id : undefined,
            }),
        )
        const assets = res.nfts.map((nft) => createNonFungibleToken(chainId ?? ChainId.Mainnet, nft))
        return createPageable(assets, createIndicator(indicator))
    }
}

export const AlchemyFlow = new AlchemyFlowAPI()
