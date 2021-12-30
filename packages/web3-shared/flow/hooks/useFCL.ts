import { useMemo } from 'react'
import type { ChainId } from '..'
import * as SDK from '../sdk'

export function useFCL(chainId: ChainId) {
    return useMemo(() => {
        return SDK.createClient(chainId)
    }, [chainId])
}
