import {
    HubOptions,
    NonFungibleAsset,
    SourceType,
    TokenType,
    createIndicator,
    createNextIndicator,
    createPageable,
    resolveIPFS_URL,
} from '@masknet/web3-shared-base'
import { ChainId, SchemaType } from '@masknet/web3-shared-evm'
import { API_KEY, CENTER_ALCHEMY_URL, CENTER_API_URL } from './constants.js'
import { fetchJSON, getAssetFullName } from '../entry-helpers.js'
import urlcat from 'urlcat'
import { Asset, Assets, Collection, NetworkName } from './type.js'
import type { Web3Helper } from '@masknet/web3-helpers'
import { formatAlchemyTokenId } from '../Alchemy/helpers.js'

function createNonFungibleAsset(chainId: Web3Helper.ChainIdAll, asset: Asset, collection: Collection) {
    return {
        id: `${asset.address}_${asset.tokenId}`,
        chainId,
        type: TokenType.NonFungible,
        schema: SchemaType.ERC721,
        tokenId: asset.tokenId,
        address: asset.address,
        metadata: {
            chainId,
            name: getAssetFullName(asset.address, collection.name, asset.metadata.name, asset.tokenId),
            symbol: collection.symbol,
            description: asset.metadata.description,
            imageURL:
                resolveIPFS_URL(asset.metadata.image) || asset.mediumPreviewImageUrl || asset.metadata.generator_url,
            mediaURL: asset.metadata.animation_url || asset.metadata.generator_url,
        },
        contract: {
            chainId,
            schema: SchemaType.ERC721,
            address: asset.address,
            name: asset.collection_name,
            symbol: collection.symbol,
        },
        collection: {
            chainId,
            name: asset.name,
            slug: '',
            description: asset.metadata.description,
        },
        link: asset.metadata.external_url,
        owner: {
            address: collection.owner || collection.creator,
        },
        traits: asset.metadata?.traits?.map((x) => ({
            type: x.trait_type,
            value: x.value,
        })),
        source: SourceType.Center,
    }
}

async function getCollection(address: string, chainId: Web3Helper.ChainIdAll) {
    const response = await fetchJSON<Collection>(
        urlcat(`${CENTER_API_URL}/:address`, { network: NetworkName[chainId], address }),
        {
            method: 'GET',
            headers: {
                'X-API-Key': API_KEY,
            },
        },
    )
    return response
}

export async function getNftAsset(address: string, tokenId: string, chainId: Web3Helper.ChainIdAll) {
    const response = await fetchJSON<Asset>(
        urlcat(`${CENTER_API_URL}/:address/:tokenId`, {
            network: NetworkName[chainId],
            address,
            tokenId,
        }),
        {
            method: 'GET',
            headers: {
                'X-API-Key': API_KEY,
            },
        },
    )
    const collection = await getCollection(address, chainId)
    return createNonFungibleAsset(chainId, response, collection)
}

export async function getNfts(
    from: string,
    { chainId = ChainId.Mainnet, indicator }: HubOptions<Web3Helper.ChainIdAll> = {},
) {
    const response = await fetchJSON<Assets>(
        urlcat(CENTER_ALCHEMY_URL, {
            network: NetworkName[chainId],
            owner: from,
            api_key: API_KEY,
        }),
    )

    const assets: Array<NonFungibleAsset<Web3Helper.ChainIdAll, Web3Helper.SchemaTypeAll>> = []
    for (const ownedNft of response.ownedNfts) {
        const asset = getNftAsset(ownedNft.contract.address, formatAlchemyTokenId(ownedNft.id.tokenId), chainId)
        assets.push(asset as unknown as NonFungibleAsset<Web3Helper.ChainIdAll, Web3Helper.SchemaTypeAll>)
    }
    return createPageable(
        assets,
        createIndicator(indicator),
        response.pageKey ? createNextIndicator(indicator, response.pageKey) : undefined,
    )
}
