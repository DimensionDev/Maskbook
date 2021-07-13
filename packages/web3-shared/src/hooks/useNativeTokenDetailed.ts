import { useAsyncRetry } from 'react-use'
import type { NativeTokenDetailed } from '../types'
import { createNativeToken } from '../utils'
import { useChainId } from './useChainId'

export function useNativeTokenDetailed() {
    const chainId = useChainId()
    return useAsyncRetry(async (): Promise<NativeTokenDetailed> => createNativeToken(chainId), [chainId])
}
