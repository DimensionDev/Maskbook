import { useDHedgeConstants } from '@masknet/web3-shared'

export function useBaseUrl() {
    return useDHedgeConstants().BASE_URL
}

export function useApiURL() {
    return useDHedgeConstants().API_URL
}

export function usePoolURL(address: string) {
    const BASE_URL = useBaseUrl()
    return new URL(`/pool/${address}`, BASE_URL).toString()
}
