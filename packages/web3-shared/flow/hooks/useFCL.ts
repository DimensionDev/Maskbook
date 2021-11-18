import { useMemo } from 'react'
import * as SDK from '../sdk'
import { useChainId } from '.'

export function useFCL() {
    const chainId = useChainId()
    return useMemo(() => {
        return SDK.createClient(chainId)
    }, [chainId])
}
