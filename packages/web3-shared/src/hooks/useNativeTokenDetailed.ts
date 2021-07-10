import { useAsyncRetry } from 'react-use'
import type { NativeTokenDetailed, NativeToken, FungibleTokenDetailed } from '../types'
import { createNativeToken } from '../utils'
import { useChainId } from './useChainId'

export function useNativeTokenDetailed() {
    const chainId = useChainId()

    return useAsyncRetry(async (): Promise<NativeTokenDetailed> => createNativeToken(chainId), [chainId])
}

export function useNativeTokensDetailed(listOfToken: Pick<NativeToken, 'address' | 'type'>[]) {
    const chainId = useChainId()

    return useAsyncRetry(async (): Promise<FungibleTokenDetailed[]> => {
        return listOfToken.map(() => createNativeToken(chainId))
    }, [chainId])
}
