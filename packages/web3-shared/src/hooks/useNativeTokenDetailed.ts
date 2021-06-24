import { useAsyncRetry } from 'react-use'
import { NativeTokenDetailed, EthereumTokenType } from '../types'
import { getChainDetailed } from '../utils'
import { useChainId } from './useChainId'
import { useTokensConstants } from '@masknet/constants'

export function useNativeTokenDetailed() {
    const chainId = useChainId()
    const { NATIVE_TOKEN_ADDRESS } = useTokensConstants()
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
