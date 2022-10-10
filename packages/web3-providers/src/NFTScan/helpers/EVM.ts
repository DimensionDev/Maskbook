import urlcat from 'urlcat'
import Web3SDK from 'web3'
import type { AbiItem } from 'web3-utils'
import { first } from 'lodash-unified'
import { createLookupTableResolver, EMPTY_LIST } from '@masknet/shared-base'
import ERC721ABI from '@masknet/web3-contracts/abis/ERC721.json'
import type { ERC721 } from '@masknet/web3-contracts/types/ERC721'
import {
    NonFungibleAsset,
    NonFungibleCollection,
    NonFungibleTokenContract,
    NonFungibleTokenEvent,
    resolveCrossOriginURL,
    resolveResourceURL,
    scale10,
    SourceType,
    TokenType,
} from '@masknet/web3-shared-base'
import { ChainId, createContract, getRPCConstants, SchemaType, WNATIVE } from '@masknet/web3-shared-evm'
import { NFTSCAN_BASE, NFTSCAN_LOGO_BASE, NFTSCAN_URL } from '../constants.js'
import type { EVM } from '../types/EVM.js'
import { getJSON, resolveNonFungibleTokenEventActivityType, getPaymentToken } from '../../helpers.js'

type NFTScanChainId = ChainId.Mainnet | ChainId.Matic | ChainId.BSC | ChainId.Arbitrum | ChainId.Optimism

export const resolveHostName = createLookupTableResolver<NFTScanChainId, string>(
    {
        [ChainId.Mainnet]: 'https://www.nftscan.com',
        [ChainId.Matic]: 'https://polygon.nftscan.com',
        [ChainId.BSC]: 'https://bnb.nftscan.com',
        [ChainId.Arbitrum]: 'https://arbitrum.nftscan.com/',
        [ChainId.Optimism]: 'https://optimism.nftscan.com/',
    },
    '',
)

export async function fetchFromNFTScan<T>(url: string) {
    const response = await fetch(resolveCrossOriginURL(url)!, {
        headers: {
            chain: 'ETH',
        },
    })
    const json = await response.json()
    return json as T
}

export async function fetchFromNFTScanV2<T>(chainId: ChainId, pathname: string, init?: RequestInit) {
    const host = resolveHostName(chainId as NFTScanChainId)
    if (!host) return

    const response = await fetch(urlcat(NFTSCAN_URL, pathname), {
        ...init,
        headers: {
            ...init?.headers,
            'x-app-chainid': chainId.toString(),
        },
        cache: 'no-cache',
    })
    const json = await response.json()
    return json as T
}

export async function getContractSymbol(address: string, chainId: ChainId) {
    const RPC_URL = first(getRPCConstants(chainId).RPC_URLS)
    if (!RPC_URL) return ''

    try {
        const web3 = new Web3SDK(RPC_URL)
        const contract = createContract<ERC721>(web3, address, ERC721ABI as AbiItem[])
        const symbol = await contract?.methods.symbol().call({})
        return symbol ?? ''
    } catch {
        return ''
    }
}

export function createPermalink(chainId: ChainId, address: string, tokenId: string) {
    return urlcat(resolveHostName(chainId as NFTScanChainId) || 'https://www.nftscan.com', '/:address/:tokenId', {
        address,
        tokenId,
    })
}

export function createNonFungibleAsset(
    chainId: ChainId,
    asset: EVM.Asset,
    collection?: EVM.AssetsGroup,
): NonFungibleAsset<ChainId, SchemaType> {
    const payload = getJSON<EVM.Payload>(asset.metadata_json)
    const contractName = asset.contract_name
    const description = payload?.description
    const uri = asset.nftscan_uri ?? asset.image_uri
    const mediaURL = resolveResourceURL(uri)

    const creator = asset.minter
    const owner = asset.owner
    const schema = asset.erc_type === 'erc1155' ? SchemaType.ERC1155 : SchemaType.ERC721
    const symbol = asset.contract_name

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
            link: urlcat(NFTSCAN_BASE + '/:id', { id: creator }),
        },
        owner: owner
            ? {
                  address: owner,
                  link: urlcat(NFTSCAN_BASE + '/:id', { id: owner }),
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
                  amount: scale10(asset.latest_trade_price, WNATIVE[chainId].decimals).toFixed(),
                  // FIXME: cannot get payment token
                  token: WNATIVE[chainId],
              }
            : undefined,
        metadata: {
            chainId,
            name:
                first([payload?.name, asset.name, contractName].find((x) => x && !x.startsWith('#'))?.split('#')) ?? '',
            symbol,
            description,
            imageURL: mediaURL,
            mediaURL,
        },
        contract: {
            chainId,
            schema,
            address: asset.contract_address,
            name: contractName,
            symbol,
        },
        collection: {
            chainId,
            name: contractName,
            slug: contractName,
            description,
            address: asset.contract_address,
            // If collectionContext.logo_url is null, we will directly render a fallback logo instead.
            // So do not fallback to the constructed NFTScan logo url
            iconURL: collection
                ? collection.logo_url
                : urlcat(NFTSCAN_LOGO_BASE + '/:id', { id: asset.contract_address + '.png' }),
            // TODO fetch via `collections` API
            verified: false,
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
    const payload = getJSON<EVM.Payload>(sample?.metadata_json)
    return {
        chainId,
        schema: sample?.erc_type === 'erc1155' ? SchemaType.ERC1155 : SchemaType.ERC721,
        name: group.contract_name,
        slug: group.contract_name,
        address: group.contract_address,
        description: group.description || payload?.description,
        iconURL: group.logo_url,
        tokensTotal: group.assets.length,
        source: SourceType.NFTScan,
    }
}

export function createNonFungibleCollectionFromCollection(
    chainId: ChainId,
    collection: EVM.Collection,
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
    collection: EVM.Collection,
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
        type: resolveNonFungibleTokenEventActivityType(transaction.event_type),
        hash: transaction.hash,
        from: {
            address: transaction.from,
        },
        to: {
            address: transaction.to,
        },
        assetName: transaction.contract_name,
        assetPermalink: createPermalink(chainId, transaction.contract_address, transaction.token_id),
        priceInToken: paymentToken
            ? {
                  amount: scale10(transaction.trade_price, paymentToken?.decimals).toFixed(),
                  token: paymentToken,
              }
            : undefined,
        paymentToken,
        source: SourceType.NFTScan,
    }
}
