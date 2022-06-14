import urlcat from 'urlcat'
import { createNativeToken, NETWORK_DESCRIPTORS } from '@masknet/web3-shared-evm'

export function isProxyENV() {
    try {
        return process.env.PROVIDER_API_ENV === 'proxy'
    } catch {
        return false
    }
}

export async function fetchJSON<T = unknown>(requestInfo: string, requestInit?: RequestInit): Promise<T> {
    const fetch = globalThis.r2d2Fetch ?? globalThis.fetch
    const res = await fetch(requestInfo, requestInit)
    return res.json()
}

const CORS_PROXY = 'https://cors.r2d2.to'
export function courier(url: string) {
    return urlcat(`${CORS_PROXY}?:url`, { url })
}

export function getAllEVMNativeAssets() {
    return NETWORK_DESCRIPTORS.filter((x) => x.isMainnet).map((x) => ({
        ...createNativeToken(x.chainId),
        balance: '0',
    }))
}
