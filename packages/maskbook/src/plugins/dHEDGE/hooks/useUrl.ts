import { useURLConstants } from '@masknet/web3-shared'
import { escapeRegExp } from 'lodash-es'

export function useBaseUrl() {
    return useURLConstants().BASE_URL
}

export function useApiURL() {
    return useURLConstants().API_URL
}

export function usePoolURL(address: string) {
    const BASE_URL = useBaseUrl()
    return new URL(`/pool/${address}`, BASE_URL).toString()
}

export function usePoolUrlPattern() {
    const baseURL = useBaseUrl()
    return new RegExp(`${escapeRegExp(baseURL)}/pool/(\\w+)`)
}

export function useIsPoolUrl() {
    const POOL_URL_PATTERN = usePoolUrlPattern()
    return (x: string): boolean => POOL_URL_PATTERN.test(x)
}
