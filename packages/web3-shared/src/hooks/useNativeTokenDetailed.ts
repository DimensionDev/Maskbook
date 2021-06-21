import { useAsyncRetry } from 'react-use'
import { TOKEN_CONSTANTS } from '../constants'
import { NativeTokenDetailed, EthereumTokenType } from '../types'
import { getChainDetailed } from '../utils'
import { useChainId } from './useChainId'
import { useConstant } from './useConstant'

export function useNativeTokenDetailed() {
    const chainId = useChainId()
    const NATIVE_TOKEN_ADDRESS = useConstant(TOKEN_CONSTANTS, 'NATIVE_TOKEN_ADDRESS')
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
