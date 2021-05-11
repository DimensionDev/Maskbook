import { useConstant } from '../../../web3/hooks/useConstant'
import { CONSTANT } from '../constants'

export function useBaseUrl() {
    return useConstant(CONSTANT, 'URL')
}

export function useApiURL() {
    return useConstant(CONSTANT, 'API_URL')
}

export function usePoolURL(address: string) {
    const BASE_URL = useBaseUrl()
    return new URL(`/pool/${address}`, BASE_URL).toString()
}

export function usePoolUrlPattern() {
    const URL = useBaseUrl()
    return RegExp(`${URL}/pool/(\\w+)`)
}

export function useIsPoolUrl() {
    const POOL_URL_PATTERN = usePoolUrlPattern()
    return (x: string): boolean => POOL_URL_PATTERN.test(x)
}
