/// <reference types="@masknet/global-types/firefox" />
/// <reference types="@masknet/global-types/flag" />

import {
    APE,
    BUSD,
    ChainId,
    createNativeToken,
    DAI,
    HUSD,
    isENSContractAddress,
    NETWORK_DESCRIPTORS,
    RARI,
    SchemaType,
    TATR,
    USDC,
    USDT,
    WBTC,
    WNATIVE,
} from '@masknet/web3-shared-evm'
import { FungibleAsset, isSameAddress, ActivityType } from '@masknet/web3-shared-base'

export async function fetchJSON<T = unknown>(
    requestInfo: string,
    requestInit?: RequestInit,
    options?: {
        fetch: typeof globalThis.fetch
    },
): Promise<T> {
    const fetch = options?.fetch ?? globalThis.fetch
    const res = await fetch(requestInfo, requestInit)
    if (!res.ok) throw new Error('Failed to fetch.')
    return res.json()
}

export async function fetchCache(info: RequestInfo, init?: RequestInit) {
    const request = new Request(info, init)

    if (request.method !== 'GET') return fetch(request)
    if (!request.url.startsWith('http')) return fetch(request)

    const { host } = new URL(request.url)
    const cache = await caches.open(host)
    const hit = await cache.match(request)
    if (hit) return hit

    const response = await fetch(request)
    if (response.ok && response.status === 200) {
        await cache.put(request.clone(), response.clone())
    }
    return response
}

export async function staleCache(info: RequestInfo, init?: RequestInit) {
    const request = new Request(info, init)

    if (request.method !== 'GET') return
    if (!request.url.startsWith('http')) return

    const { host } = new URL(request.url)
    const cache = await caches.open(host)
    await cache.delete(request)
}

export function getAllEVMNativeAssets(): Array<FungibleAsset<ChainId, SchemaType>> {
    return NETWORK_DESCRIPTORS.filter((x) => x.isMainnet).map((x) => ({
        ...createNativeToken(x.chainId),
        balance: '0',
    }))
}

export function parseJSON<T>(json?: string): T | undefined {
    if (!json) return
    try {
        return JSON.parse(json) as T
    } catch {
        return
    }
}

export function getPaymentToken(chainId: ChainId, token?: { name?: string; symbol?: string; address?: string }) {
    if (!token) return

    return [
        createNativeToken(chainId),
        /* cspell:disable-next-line */
        ...[APE, USDC, USDT, DAI, HUSD, BUSD, WBTC, WNATIVE, TATR, RARI].map((x) => x[chainId]),
    ].find(
        (x) =>
            x.name.toLowerCase() === token.name?.toLowerCase() ||
            x.symbol.toLowerCase() === token.symbol?.toLowerCase() ||
            isSameAddress(x.address, token.address),
    )
}

export function getAssetFullName(contract_address: string, contractName: string, name?: string, tokenId?: string) {
    if (!name)
        return tokenId && contractName
            ? `${contractName} #${tokenId}`
            : !contractName && tokenId
            ? `#${tokenId}`
            : contractName
    if (isENSContractAddress(contract_address)) return `ENS #${name}`

    const [first, next] = name.split('#').map((x) => x.trim())
    if (first && next) return `${first} #${next}`
    if (!first && next) return contractName ? `${contractName} #${next}` : `#${next}`

    if (contractName && tokenId)
        return contractName.toLowerCase() === first.toLowerCase()
            ? `${contractName} #${tokenId}`
            : `${contractName} #${first}`
    if (!contractName && !tokenId) return first
    if (!contractName && tokenId) return `${first} #${tokenId}`

    return `${contractName} #${first}`
}

export const resolveActivityType = (type?: string) => {
    if (!type) return ActivityType.Transfer
    const type_ = type.toLowerCase()
    if (['created', 'mint'].includes(type_)) return ActivityType.Mint
    if (['successful'].includes(type_)) return ActivityType.Sale
    if (['offer', 'offer_entered', 'bid_withdrawn', 'bid_entered'].includes(type_)) return ActivityType.Offer
    if (['cancel_offer'].includes(type_)) return ActivityType.CancelOffer
    if (['list'].includes(type_)) return ActivityType.List
    if (['sale'].includes(type_)) return ActivityType.Sale
    return ActivityType.Transfer
}
