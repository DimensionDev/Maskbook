import urlcat from 'urlcat'
import Web3SDK from 'web3'
import type { AbiItem } from 'web3-utils'
import { first } from 'lodash-unified'
import { EMPTY_LIST } from '@masknet/shared-base'
import ERC721ABI from '@masknet/web3-contracts/abis/ERC721.json'
import type { ERC721 } from '@masknet/web3-contracts/types/ERC721'
import {
    createLookupTableResolver,
    NonFungibleAsset,
    NonFungibleTokenCollection,
    NonFungibleTokenContract,
    NonFungibleTokenEvent,
    scale10,
    TokenType,
} from '@masknet/web3-shared-base'
import {
    ChainId,
    createContract,
    getRPCConstants,
    resolveIPFSLinkFromURL,
    SchemaType,
    WNATIVE,
} from '@masknet/web3-shared-evm'
import { NFTSCAN_BASE, NFTSCAN_LOGO_BASE, NFTSCAN_URL } from './constants'
import type { Asset, Collection, Payload, AssetsGroup, Transaction } from './types'
import { courier, getPaymentToken } from '../helpers'

type NFTScanChainId = ChainId.Mainnet | ChainId.Matic | ChainId.BSC | ChainId.Arbitrum | ChainId.Optimism

export const resolveHostName = createLookupTableResolver<NFTScanChainId, string>(
    {
        [ChainId.Mainnet]: 'https://www.nftsca.com',
        [ChainId.Matic]: 'https://polygon.nftscan.com',
        [ChainId.BSC]: 'https://bnb.nftscan.com',
        [ChainId.Arbitrum]: 'https://arbitrum.nftscan.com/',
        [ChainId.Optimism]: 'https://optimism.nftscan.com/',
    },
    '',
)

export async function fetchFromNFTScan<T>(url: string) {
    const response = await fetch(courier(url), {
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
            chainId: chainId.toString(),
        },
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

export function getPayload(json?: string): Payload {
    if (!json) return {}
    try {
        return JSON.parse(json) as Payload
    } catch {
        return {}
    }
}

export function createPermalink(chainId: ChainId, address: string, tokenId: string) {
    return urlcat(resolveHostName(chainId as NFTScanChainId) || 'https://www.nftsca.com', '/:address/:tokenId', {
        address,
        tokenId,
    })
}

export function createNonFungibleTokenAsset(chainId: ChainId, asset: Asset): NonFungibleAsset<ChainId, SchemaType> {
    const payload = getPayload(asset.metadata_json)
    const name = payload?.name || asset.name || asset.contract_name || ''
    const description = payload?.description
    const mediaURL = resolveIPFSLinkFromURL(
        asset.nftscan_uri ?? asset.image_uri?.startsWith('http')
            ? asset.image_uri
            : asset.image_uri
            ? `ipfs://${asset.image_uri}`
            : undefined,
    )

    const creator = asset.minter
    const owner = asset.owner
    const schema = asset.erc_type === 'erc1155' ? SchemaType.ERC1155 : SchemaType.ERC721
    const symbol = asset.contract_name

    return {
        id: asset.contract_address,
        chainId,
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
            name,
            symbol,
            description,
            imageURL: mediaURL,
            mediaURL,
        },
        contract: {
            chainId,
            schema,
            address: asset.contract_address,
            name,
            symbol,
        },
        collection: {
            chainId,
            name,
            slug: name,
            description,
            iconURL: urlcat(NFTSCAN_LOGO_BASE + '/:id', { id: asset.contract_address + '.png' }),
            // TODO fetch via `collections` API
            verified: false,
            createdAt: asset.mint_timestamp,
        },
    }
}

export function createNonFungibleTokenCollectionFromGroup(
    chainId: ChainId,
    group: AssetsGroup,
): NonFungibleTokenCollection<ChainId, SchemaType> {
    const sample = first(group.assets)
    const payload = getPayload(sample?.metadata_json)
    return {
        chainId,
        schema: sample?.erc_type === 'erc1155' ? SchemaType.ERC1155 : SchemaType.ERC721,
        name: group.contract_name,
        slug: group.contract_name,
        address: group.contract_address,
        description: group.description || payload.description,
        iconURL: group.logo_url,
        balance: group.assets.length,
    }
}

export function createNonFungibleTokenCollectionFromCollection(
    chainId: ChainId,
    collection: Collection,
): NonFungibleTokenCollection<ChainId, SchemaType> {
    return {
        chainId,
        schema: collection.erc_type === 'erc1155' ? SchemaType.ERC1155 : SchemaType.ERC721,
        name: collection.name,
        symbol: collection.symbol,
        slug: collection.symbol,
        address: collection.contract_address,
        description: collection.description,
        iconURL: collection.logo_url,
    }
}

export function createNonFungibleTokenContract(
    chainId: ChainId,
    collection: Collection,
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
    }
}

export function createNonFungibleTokenEvent(
    chainId: ChainId,
    transaction: Transaction,
): NonFungibleTokenEvent<ChainId, SchemaType> {
    const paymentToken = getPaymentToken(chainId, { symbol: transaction.trade_symbol })
    return {
        chainId,
        id: transaction.hash,
        quantity: transaction.amount,
        timestamp: transaction.timestamp,
        type: transaction.event_type,
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
    }
}
