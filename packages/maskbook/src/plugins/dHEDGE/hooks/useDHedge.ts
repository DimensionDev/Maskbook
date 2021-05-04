import { useConstant } from '../../../web3/hooks/useConstant'
import { DHEDGE_CONSTANT } from '../constants'

export function useDHedgeUrl() {
    return useConstant(DHEDGE_CONSTANT, 'DHEDGE_URL')
}

export function useDHedgeApiURL() {
    return useConstant(DHEDGE_CONSTANT, 'DHEDGE_API_URL')
}

export function useDHedgePoolURL(address: string) {
    const DHEDGE_URL = useDHedgeUrl()
    return new URL(`/pool/${address}`, DHEDGE_URL).toString()
}

export function useDHedgePoolPattern() {
    const DHEDGE_URL = useDHedgeUrl()
    return RegExp(DHEDGE_URL + '/pool/(\\w+)')
}

export function useIsDHedgePool() {
    const DHEDGE_POOL_PATTERN = useDHedgePoolPattern()
    return (x: string): boolean => DHEDGE_POOL_PATTERN.test(x)
}
