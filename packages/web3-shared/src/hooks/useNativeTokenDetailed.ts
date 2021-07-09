import { useAsyncRetry } from 'react-use'
import { useTokenConstants } from '../constants'
import { EthereumTokenType, NativeTokenDetailed, ChainId, NativeToken, FungibleTokenDetailed } from '../types'
import { getChainDetailed } from '../utils'
import { useChainId } from './useChainId'

export function useNativeTokenDetailed() {
    const chainId = useChainId()
    const { NATIVE_TOKEN_ADDRESS } = useTokenConstants()
    return useAsyncRetry(
        async (): Promise<NativeTokenDetailed> =>
            createTokenDetailed(NATIVE_TOKEN_ADDRESS, chainId, getChainDetailed(chainId)?.nativeCurrency),
        [chainId, NATIVE_TOKEN_ADDRESS],
    )
}

export function useNativeTokensDetailed(listOfToken: Pick<NativeToken, 'address' | 'type'>[]) {
    const chainId = useChainId()
    const { NATIVE_TOKEN_ADDRESS } = useTokenConstants()
    return useAsyncRetry(async (): Promise<FungibleTokenDetailed[]> => {
        const nativeCurrency = getChainDetailed(chainId)?.nativeCurrency
        return listOfToken.map(() => createTokenDetailed(NATIVE_TOKEN_ADDRESS, chainId, nativeCurrency))
    }, [chainId, NATIVE_TOKEN_ADDRESS])
}

function createTokenDetailed(
    address: string,
    chainId: ChainId,
    nativeCurrency:
        | {
              name: string
              symbol: string
              decimals: number
          }
        | undefined,
) {
    return {
        type: EthereumTokenType.Native,
        address,
        chainId,
        name: nativeCurrency?.name ?? 'Unknown',
        symbol: nativeCurrency?.symbol ?? '',
        decimals: nativeCurrency?.decimals ?? 0,
    } as NativeTokenDetailed
}
