import urlcat from 'urlcat'
import { EMPTY_LIST } from '@masknet/shared-base'
import { ChainId, createNativeToken, SchemaType } from '@masknet/web3-shared-solana'
import {
    NonFungibleAsset,
    NonFungibleCollection,
    NonFungibleTokenContract,
    NonFungibleTokenEvent,
    resolveCrossOriginURL,
    resolveIPFS_URL,
    scale10,
    SourceType,
    TokenType,
} from '@masknet/web3-shared-base'
import { NFTSCAN_BASE_SOLANA, NFTSCAN_URL } from '../constants.js'
import type { Solana } from '../types/index.js'
import { resolveActivityType, parseJSON, getAssetFullName } from '../../entry-helpers.js'

export function createPermalink(chainId: ChainId, address?: string) {
    if (!address) return
    return urlcat('https://solana.nftscan.com', '/:address', {
        address,
    })
}

export async function fetchFromNFTScan<T>(url: string) {
    const response = await fetch(resolveCrossOriginURL(url)!)
    const json = await response.json()
    return json as T
}

export async function fetchFromNFTScanV2<T>(chainId: ChainId, pathname: string, init?: RequestInit) {
    if (chainId !== ChainId.Mainnet) return

    const response = await fetch(urlcat(NFTSCAN_URL, pathname), {
        ...init,
        headers: {
            ...init?.headers,
            'x-app-chainid': 'solana',
        },
        cache: 'no-cache',
    })
    const json = await response.json()
    return json as T
}

export function createNonFungibleAsset(chainId: ChainId, asset: Solana.Asset): NonFungibleAsset<ChainId, SchemaType> {
    const payload = parseJSON<Solana.Payload>(asset.metadata_json)
    const name = payload?.name || asset.name || payload?.name || ''
    const description = payload?.description
    const mediaURL = resolveIPFS_URL(asset.image_uri ?? asset.content_uri)

    const creator = asset.minter
    const owner = asset.owner
    const schema = SchemaType.NonFungible
    const symbol = payload?.symbol
    const nativeToken = createNativeToken(chainId)

    return {
        id: asset.token_address,
        chainId,
        link: createPermalink(chainId, asset.token_address),
        tokenId: '',
        type: TokenType.NonFungible,
        address: asset.token_address,
        schema,
        creator: {
            address: creator,
            link: urlcat(NFTSCAN_BASE_SOLANA + '/:id', { id: creator }),
        },
        owner: owner
            ? {
                  address: owner,
                  link: urlcat(NFTSCAN_BASE_SOLANA + '/:id', { id: owner }),
              }
            : undefined,
        traits:
            asset.attributes?.map((x) => ({
                type: x.attribute_name,
                value: x.attribute_value,
                rarity: x.percentage,
            })) ?? EMPTY_LIST,
        priceInToken: asset.latest_trade_price
            ? {
                  amount: scale10(asset.latest_trade_price, nativeToken.decimals).toFixed(),
                  // FIXME: cannot get payment token
                  token: nativeToken,
              }
            : undefined,
        metadata: {
            chainId,
            name: getAssetFullName(asset.token_address, name, name),
            symbol,
            description,
            imageURL: mediaURL,
            mediaURL,
            projectURL: asset.external_link,
        },
        contract: {
            chainId,
            schema,
            address: asset.token_address,
            name,
            symbol,
        },
        collection: {
            chainId,
            name,
            slug: payload?.symbol || name,
            description,
            address: asset.token_address,
            iconURL: '',
            // TODO fetch via `collections` API
            verified: false,
            createdAt: asset.mint_timestamp,
        },
        source: SourceType.NFTScan,
    }
}

export function createNonFungibleCollection(
    chainId: ChainId,
    collection: Solana.Collection,
): NonFungibleCollection<ChainId, SchemaType> {
    return {
        chainId,
        schema: SchemaType.NonFungible,
        name: collection.collection || collection.symbol || '',
        symbol: collection.symbol,
        slug: collection.symbol || '',
        address: '',
        tokensTotal: collection.items_total,
        description: collection.description,
        iconURL: collection.logo_url,
        verified: collection.verified,
    }
}

export function createNonFungibleTokenContract(
    chainId: ChainId,
    collection: Solana.Collection,
): NonFungibleTokenContract<ChainId, SchemaType> {
    return {
        chainId,
        address: '',
        name: collection.collection || collection.symbol || '',
        symbol: collection.symbol,
        schema: SchemaType.NonFungible,
        iconURL: collection.logo_url,
        logoURL: collection.logo_url,
    }
}

export function createNonFungibleTokenEvent(
    chainId: ChainId,
    transaction: Solana.Transaction,
): NonFungibleTokenEvent<ChainId, SchemaType> {
    const paymentToken = createNativeToken(chainId)
    return {
        chainId,
        id: transaction.hash,
        quantity: '1',
        timestamp: transaction.timestamp ?? 0,
        type: resolveActivityType(transaction.event_type),
        hash: transaction.hash,
        from: transaction.source
            ? {
                  address: transaction.source,
              }
            : undefined,
        to: transaction.destination
            ? {
                  address: transaction.destination,
              }
            : undefined,
        assetName: transaction.exchange_name,
        assetPermalink: createPermalink(chainId, transaction.token_address),
        priceInToken:
            paymentToken && transaction.trade_price
                ? {
                      amount: scale10(transaction.trade_price ?? 0, paymentToken?.decimals).toFixed(),
                      token: paymentToken,
                  }
                : undefined,
        paymentToken,
        source: SourceType.NFTScan,
    }
}
