import { escapeRegExp } from 'lodash-es'
import { BASE_URL } from '../constants'

export function useBaseUrl() {
    return BASE_URL
}

export function useMarketURL(address: string) {
    const BASE_URL = useBaseUrl()
    return new URL(`/#!/market?id=${address}`, BASE_URL).toString()
}

export function useMarketUrlPattern() {
    const baseURL = useBaseUrl()
    return new RegExp(`${escapeRegExp(baseURL.concat('/#!/market?id='))}([x0-9A-Fa-f-]+$)`)
}

export function useIsMarketUrl() {
    const MARKET_URL_PATTERN = useMarketUrlPattern()
    return (x: string): boolean => MARKET_URL_PATTERN.test(x)
}
