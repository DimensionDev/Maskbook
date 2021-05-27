import { useAsyncRetry } from 'react-use'
import { CONSTANTS } from '../constants'
import { resolveChainCurrency } from '../pipes'
import { NativeTokenDetailed, EthereumTokenType } from '../types'
import { useChainId } from './useChainId'
import { useConstant } from './useConstant'

export function useNativeTokenDetailed() {
    const chainId = useChainId()
    const NATIVE_TOKEN_ADDRESS = useConstant(CONSTANTS, 'NATIVE_TOKEN_ADDRESS')
    return useAsyncRetry(async (): Promise<NativeTokenDetailed> => {
        const nativeCurrency = resolveChainCurrency(chainId)
        return {
            type: EthereumTokenType.Native,
            address: NATIVE_TOKEN_ADDRESS,
            chainId,
            name: nativeCurrency.name,
            symbol: nativeCurrency.symbol,
            decimals: nativeCurrency.decimals,
        }
    }, [chainId, NATIVE_TOKEN_ADDRESS])
}
