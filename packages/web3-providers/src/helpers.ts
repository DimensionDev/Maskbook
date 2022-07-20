import { ChainId, createNativeToken, NETWORK_DESCRIPTORS, SchemaType } from '@masknet/web3-shared-evm'
import type { FungibleAsset } from '@masknet/web3-shared-base'

export function isProxyENV() {
    try {
        return process.env.PROVIDER_API_ENV === 'proxy'
    } catch {
        return false
    }
}

export async function fetchJSON<T = unknown>(requestInfo: string, requestInit?: RequestInit): Promise<T> {
    const response = await globalThis.r2d2Fetch(requestInfo, requestInit)
    return response.json()
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
