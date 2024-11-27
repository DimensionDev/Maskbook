import urlcat from 'urlcat'
import { first } from 'lodash-es'
import { EMPTY_LIST, NetworkPluginID } from '@masknet/shared-base'
import {
    formatPercentage,
    type NonFungibleAsset,
    type NonFungibleCollection,
    type NonFungibleTokenContract,
    type NonFungibleTokenEvent,
    type NonFungibleTokenTrait,
    resolveResourceURL,
    scale10,
    SourceType,
    TokenType,
} from '@masknet/web3-shared-base'
import {
    type ChainId,
    isENSContractAddress,
    SchemaType,
    WNATIVE,
    isValidDomain,
    resolveImageURL,
} from '@masknet/web3-shared-evm'
import { EVMChainResolver } from '../../Web3/EVM/apis/ResolverAPI.js'
import { NFTSCAN_BASE, NFTSCAN_LOGO_BASE, NFTSCAN_URL } from '../constants.js'
import type { EVM } from '../types/EVM.js'
import { resolveNFTScanHostName } from './utils.js'
import { fetchSquashedJSON } from '../../helpers/fetchJSON.js'
import { parseJSON } from '../../helpers/parseJSON.js'
import { getAssetFullName } from '../../helpers/getAssetFullName.js'
import { getPaymentToken } from '../../helpers/getPaymentToken.js'
import { resolveActivityType } from '../../helpers/resolveActivityType.js'
import type { NonFungibleTokenAPI } from '../../entry-types.js'

export async function fetchFromNFTScanV2<T>(chainId: ChainId, pathname: string, init?: RequestInit) {
    return fetchSquashedJSON<T>(urlcat(NFTSCAN_URL, pathname), {
        ...init,
        headers: {
            'content-type': 'application/json',
            ...init?.headers,
            ...(chainId ? { 'x-app-chainid': chainId.toString() } : {}),
        },
        cache: 'no-cache',
    })
}

export function createPermalink(chainId: ChainId, address: string, tokenId: string) {
    return urlcat(
        resolveNFTScanHostName(NetworkPluginID.PLUGIN_EVM, chainId) || 'https://www.nftscan.com',
        '/:address/:tokenId',
        {
            address,
            tokenId,
        },
    )
}

function getAssetTraits(asset: EVM.Asset): NonFungibleTokenTrait[] {
    if (asset.attributes.length) {
        return asset.attributes.map((x) => ({
            type: x.attribute_name,
            value: x.attribute_value,
            rarity: x.percentage,
        }))
    }
    // Manually get traits from metadata, since NFTScan doesn't return
    // attributes at this time.
    if (isENSContractAddress(asset.contract_address)) {
        const payload = parseJSON<EVM.Payload>(asset.metadata_json)
        return (
            payload?.attributes?.map((x) => ({
                type: x.trait_type,
                value: x.value,
            })) ?? EMPTY_LIST
        )
    }
    return EMPTY_LIST
}

export function createNonFungibleAsset(
    chainId: ChainId,
    asset: EVM.Asset,
    collection?: NonFungibleTokenAPI.Collection | EVM.AssetsGroup,
): NonFungibleAsset<ChainId, SchemaType> {
    const payload = parseJSON<EVM.Payload>(asset.metadata_json)
    const contractName = asset.contract_name
    const description = payload?.description ?? collection?.description ?? ''
    const uri = asset.imageURL ?? asset.image_uri
    const mediaURL = resolveResourceURL(uri)

    const creator = asset.minter
    const owner = asset.owner
    const schema = asset.erc_type === 'erc1155' ? SchemaType.ERC1155 : SchemaType.ERC721
    const symbol = asset.contract_name
    const name =
        isValidDomain(asset.name) ?
            asset.name
        :   getAssetFullName(asset.contract_address, contractName, payload?.name || asset.name, asset.token_id)

    return {
        id: asset.contract_address,
        chainId,
        link: createPermalink(chainId, asset.contract_address, asset.token_id),
        tokenId: asset.token_id,
        type: TokenType.NonFungible,
        address: asset.contract_address,
        schema,
        creator: {
            address: creator,
            link: urlcat(NFTSCAN_BASE, creator),
        },
        owner:
            owner ?
                {
                    address: owner,
                    link: urlcat(NFTSCAN_BASE, owner),
                }
            :   undefined,
        traits: getAssetTraits(asset),
        priceInToken:
            asset.latest_trade_price ?
                {
                    amount: scale10(asset.latest_trade_price, WNATIVE[chainId].decimals).toFixed(),
                    // FIXME: cannot get payment token
                    token:
                        asset.latest_trade_symbol === 'ETH' ?
                            (EVMChainResolver.nativeCurrency(chainId) ?? WNATIVE[chainId])
                        :   WNATIVE[chainId],
                }
            :   undefined,
        metadata: {
            chainId,
            name,
            symbol,
            description,
            imageURL: resolveImageURL(mediaURL, name, asset.contract_address),
            mediaURL,
        },
        contract: {
            chainId,
            schema,
            address: asset.contract_address,
            name: contractName,
            symbol,
            creatorEarning:
                collection && 'royalty' in collection ? formatPercentage(collection.royalty / 100 / 100) : undefined,
        },
        collection: {
            chainId,
            name: contractName,
            slug: contractName,
            description,
            address: asset.contract_address,
            // If collectionContext.logo_url is null, we will directly render a fallback logo instead.
            // So do not fallback to the constructed NFTScan logo url
            iconURL: collection ? collection.logo_url : `${urlcat(NFTSCAN_LOGO_BASE, asset.contract_address)}.png`,
            verified: collection?.verified || collection?.opensea_verified,
            createdAt: asset.mint_timestamp,
        },
        source: SourceType.NFTScan,
    }
}

export function createNonFungibleCollectionFromGroup(
    chainId: ChainId,
    group: EVM.AssetsGroup,
): NonFungibleCollection<ChainId, SchemaType> {
    const sample = first(group.assets)
    const payload = parseJSON<EVM.Payload>(sample?.metadata_json)
    return {
        id: group.contract_address,
        chainId,
        assets: group.assets.map((x) => createNonFungibleAsset(chainId, x)),
        schema: sample?.erc_type === 'erc1155' ? SchemaType.ERC1155 : SchemaType.ERC721,
        name: group.contract_name || group.symbol || '',
        symbol: group.symbol,
        slug: group.contract_name || '',
        address: group.contract_address,
        description: group.description || payload?.description,
        iconURL: group.logo_url,
        balance: group.assets.length,
        source: SourceType.NFTScan,
    }
}

export function createNonFungibleCollectionFromCollection(
    chainId: ChainId,
    collection: NonFungibleTokenAPI.Collection,
): NonFungibleCollection<ChainId, SchemaType> {
    return {
        chainId,
        schema: collection.erc_type === 'erc1155' ? SchemaType.ERC1155 : SchemaType.ERC721,
        name: collection.name,
        symbol: collection.symbol,
        slug: collection.symbol,
        address: collection.contract_address,
        description: collection.description,
        iconURL: collection.logo_url,
        verified: collection.verified,
        source: SourceType.NFTScan,
    }
}

export function createNonFungibleTokenContract(
    chainId: ChainId,
    collection: NonFungibleTokenAPI.Collection,
): NonFungibleTokenContract<ChainId, SchemaType> {
    return {
        chainId,
        address: collection.contract_address,
        name: collection.name,
        symbol: collection.symbol,
        schema: collection.erc_type === 'erc1155' ? SchemaType.ERC1155 : SchemaType.ERC721,
        iconURL: collection.logo_url,
        logoURL: collection.logo_url,
        owner: collection.owner,
        source: SourceType.NFTScan,
    }
}

export function createNonFungibleTokenEvent(
    chainId: ChainId,
    transaction: EVM.Transaction,
): NonFungibleTokenEvent<ChainId, SchemaType> {
    const paymentToken = getPaymentToken(chainId, { symbol: transaction.trade_symbol })
    return {
        chainId,
        id: transaction.hash,
        quantity: transaction.amount,
        timestamp: transaction.timestamp,
        type: resolveActivityType(transaction.event_type),
        hash: transaction.hash,
        from: {
            address: transaction.from,
        },
        to: {
            address: transaction.to,
        },
        send: {
            address: transaction.send,
        },
        receive: {
            address: transaction.receive,
        },
        assetName: transaction.contract_name,
        assetPermalink: createPermalink(chainId, transaction.contract_address, transaction.token_id),
        priceInToken:
            paymentToken ?
                {
                    amount: scale10(transaction.trade_price, paymentToken.decimals).toFixed(),
                    token: paymentToken,
                }
            :   undefined,
        paymentToken,
        source: SourceType.NFTScan,
    }
}
