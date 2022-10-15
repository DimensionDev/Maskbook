/// <reference types="@masknet/global-types/firefox" />
/// <reference types="@masknet/global-types/flag" />

import {
    APE,
    BUSD,
    ChainId,
    createNativeToken,
    DAI,
    HUSD,
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
import { first } from 'lodash-unified'

export async function fetchJSON<T = unknown>(
    requestInfo: string,
    requestInit?: RequestInit,
    options?: {
        fetch: typeof globalThis.fetch
    },
): Promise<T> {
    const fetch = options?.fetch ?? globalThis.fetch
    const res = await fetch(requestInfo, requestInit)
    return res.json()
}

export function getAllEVMNativeAssets(): Array<FungibleAsset<ChainId, SchemaType>> {
    return NETWORK_DESCRIPTORS.filter((x) => x.isMainnet).map((x) => ({
        ...createNativeToken(x.chainId),
        balance: '0',
    }))
}

export function getJSON<T>(json?: string): T | undefined {
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

export const resolveNonFungibleTokenEventActivityType = (type?: string) => {
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

export function getNFTName(name?: string, tokenId?: string) {
    if (!name) return ''
    const _name = (first(name.split('#')) ?? '').trim()
    return tokenId ? _name.replace(` ${tokenId}`, '').trim() : _name
}
