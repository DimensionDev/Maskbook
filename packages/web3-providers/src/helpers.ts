/// <reference types="@masknet/global-types/firefox" />
/// <reference types="@masknet/global-types/flag" />

import urlcat from 'urlcat'
import { ChainId, createNativeToken, NETWORK_DESCRIPTORS, SchemaType } from '@masknet/web3-shared-evm'
import type { FungibleAsset } from '@masknet/web3-shared-base'

export function isProxyENV() {
    try {
        return process.env.PROVIDER_API_ENV === 'proxy'
    } catch {
        return false
    }
}

export async function fetchJSON<T = unknown>(
    requestInfo: string,
    requestInit?: RequestInit,
    options?: {
        fetch: typeof globalThis.fetch
    },
): Promise<T> {
    const fetch = options?.fetch ?? globalThis.r2d2Fetch ?? globalThis.fetch
    const res = await fetch(requestInfo, requestInit)
    return res.json()
}

const CORS_PROXY = 'https://cors.r2d2.to'
export function courier(url: string) {
    return urlcat(`${CORS_PROXY}?:url`, { url })
}

export function getAllEVMNativeAssets(): Array<FungibleAsset<ChainId, SchemaType>> {
    return NETWORK_DESCRIPTORS.filter((x) => x.isMainnet).map((x) => ({
        ...createNativeToken(x.chainId),
        balance: '0',
    }))
}

export function getTraderAllAPICachedFlag(): RequestCache {
    // TODO: handle flags
    // cache: Flags.trader_all_api_cached_enabled ? 'force-cache' : 'default',
    return 'default'
}

export async function contentFetch(url: string, config?: RequestInit) {
    const fetch =
        process.env.engine === 'firefox' && process.env.manifest === '2' && typeof content === 'object'
            ? content.fetch
            : globalThis.fetch
    return fetch(url, config)
}

export async function fetchText(input: RequestInfo | URL, init?: RequestInit): Promise<string> {
    const fetch =
        process.env.engine === 'firefox' && process.env.manifest === '2' && typeof content === 'object'
            ? content.fetch
            : globalThis.fetch
    const response = await fetch(input, init)
    if (!response.ok) throw new Error('Failed to fetch as Text.')
    return response.text()
}
