import { useMemo } from 'react'
import type { ChainId } from '../types.js'
import * as SDK from '../sdk/index.js'

export function useFCL(chainId: ChainId) {
    return useMemo(() => {
        return SDK.createClient(chainId)
    }, [chainId])
}
