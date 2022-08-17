import ERC721ABI from '@masknet/web3-contracts/abis/ERC721.json'
import type { ERC721 } from '@masknet/web3-contracts/types/ERC721'
import { CurrencyType, NonFungibleAsset, TokenType } from '@masknet/web3-shared-base'
import { ChainId, createContract, getRPCConstants, SchemaType } from '@masknet/web3-shared-evm'
import { first } from 'lodash-unified'
import LRUCache from 'lru-cache'
import type { ParamMap } from 'urlcat'
import urlcat from 'urlcat'
import Web3SDK from 'web3'
import type { AbiItem } from 'web3-utils'
import { courier } from '../helpers'
import { NFTSCAN_BASE, NFTSCAN_BASE_API, NFTSCAN_LOGO_BASE } from './constants'
import type { NFTScanAsset } from './types'

export const fetchFromNFTScan = (url: string) => {
    return fetch(courier(url), {
        headers: {
            chain: 'ETH',
        },
    })
}

const cache = new LRUCache<string, any>({
    max: 100,
    ttl: 300_000,
})

export async function fetchV2<T>(path: string, params: ParamMap = {}, options: LRUCache.SetOptions<string, any> = {}) {
    const url = urlcat(NFTSCAN_BASE_API, path, params)
    const cachedValue: Promise<Response> | T =
        cache.get(url) ??
        fetch(url, {
            headers: { 'Content-type': 'application/json' },
        })
    // Allow other newer requests to reuse
    cache.set(url, cachedValue)
    if (cachedValue instanceof Promise) {
        const response = (await cachedValue).clone()
        if (!response.ok) {
            cache.delete(url)
            return
        }
        const payload: { data: T } = await response.json()
        cache.set(url, payload.data, options)
        return payload.data
    }
    return cachedValue
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

const NFTScanSchemaMap: Record<string, SchemaType> = {
    erc721: SchemaType.ERC721,
    erc1155: SchemaType.ERC1155,
}
export function createERC721TokenAsset(asset: NFTScanAsset): NonFungibleAsset<ChainId, SchemaType> {
    const payload: {
        name?: string
        description?: string
        image?: string
    } = JSON.parse(asset.metadata_json ?? '{}')
    const name = payload?.name || asset.name || asset.contract_name || ''
    const description = payload?.description
    const mediaURL = asset.nftscan_uri ?? asset.image_uri
    const chainId = ChainId.Mainnet
    const creator = asset.minter
    const owner = asset.owner
    const schema = NFTScanSchemaMap[asset.erc_type] ?? SchemaType.ERC721
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
        owner: {
            address: owner,
            link: urlcat(NFTSCAN_BASE + '/:id', { id: owner }),
        },
        traits: [],
        price: {
            [CurrencyType.USD]: asset.latest_trade_price ?? '0',
        },
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

export const prependIpfs = (url: string) => {
    if (!url || url.match(/^\w+:/)) return url
    return `https://nftscan.mypinata.cloud/ipfs/${url}`
}
