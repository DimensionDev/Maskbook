import { useAsyncRetry } from 'react-use'
import { CONSTANTS } from '../constants'
import { NativeTokenDetailed, EthereumTokenType } from '../types'
import { useChainId } from './useChainId'
import { useConstant } from './useConstant'

export function useNativeTokenDetailed() {
    const chainId = useChainId()
    const NATIVE_TOKEN_ADDRESS = useConstant(CONSTANTS, 'NATIVE_TOKEN_ADDRESS')
    const NATIVE_TOKEN_NAME = useConstant(CONSTANTS, 'NATIVE_TOKEN_NAME')
    const NATIVE_TOKEN_SYMBOL = useConstant(CONSTANTS, 'NATIVE_TOKEN_SYMBOL')
    return useAsyncRetry(
        async (): Promise<NativeTokenDetailed> => ({
            type: EthereumTokenType.Native,
            address: NATIVE_TOKEN_ADDRESS,
            chainId,
            name: NATIVE_TOKEN_NAME,
            symbol: NATIVE_TOKEN_SYMBOL,
            decimals: 18,
        }),
        [chainId, NATIVE_TOKEN_ADDRESS, NATIVE_TOKEN_NAME, NATIVE_TOKEN_SYMBOL],
    )
}
