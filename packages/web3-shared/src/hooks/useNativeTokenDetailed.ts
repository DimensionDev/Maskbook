import { useAsyncRetry } from 'react-use'
import { useTokenConstants } from '../constants'
import { EthereumTokenType, NativeTokenDetailed } from '../types'
import { getChainDetailed } from '../utils'
import { useChainId } from './useChainId'

export function useNativeTokenDetailed() {
    const chainId = useChainId()
    const { NATIVE_TOKEN_ADDRESS } = useTokenConstants()
    return useAsyncRetry(async (): Promise<NativeTokenDetailed> => {
        const nativeCurrency = getChainDetailed(chainId)?.nativeCurrency
        return {
            type: EthereumTokenType.Native,
            address: NATIVE_TOKEN_ADDRESS,
            chainId,
            name: nativeCurrency?.name ?? 'Unknown',
            symbol: nativeCurrency?.symbol ?? '',
            decimals: nativeCurrency?.decimals ?? 0,
        }
    }, [chainId, NATIVE_TOKEN_ADDRESS])
}
