import { useAsyncRetry } from 'react-use'
import { createNativeToken } from '../utils'
import { useChainId } from './useChainId'

export function useNativeTokenDetailed() {
    const chainId = useChainId()
    return useAsyncRetry(async () => createNativeToken(chainId), [chainId])
}
