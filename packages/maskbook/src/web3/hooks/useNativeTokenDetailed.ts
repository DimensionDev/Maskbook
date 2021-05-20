import { useAsyncRetry } from 'react-use'
import { CONSTANTS } from '../constants'
import { NativeTokenDetailed, EthereumTokenType } from '../types'
import { useChainId } from './useChainId'
import { useConstant } from './useConstant'

export function useNativeTokenDetailed() {
    const chainId = useChainId()
    const NATIVE_TOKEN_ADDRESS = useConstant(CONSTANTS, 'NATIVE_TOKEN_ADDRESS')
    return useAsyncRetry(
        async (): Promise<NativeTokenDetailed> => ({
            type: EthereumTokenType.Native,
            address: NATIVE_TOKEN_ADDRESS,
            chainId,
            name: 'Ether',
            symbol: 'ETH',
            decimals: 18,
        }),
        [chainId, NATIVE_TOKEN_ADDRESS],
    )
}
