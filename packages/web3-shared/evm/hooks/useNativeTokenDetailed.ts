import { useAsyncRetry } from 'react-use'
import { createNativeToken } from '../utils'
import { useChainId } from './useChainId'
import type { ChainId } from '../types'

export function useNativeTokenDetailed(chainId?: ChainId) {
    const currentChainId = useChainId()
    return useAsyncRetry(async () => createNativeToken(chainId ?? currentChainId), [currentChainId, chainId])
}
