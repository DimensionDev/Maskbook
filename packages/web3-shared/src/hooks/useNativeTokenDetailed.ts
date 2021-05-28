import { EthereumTokenType, ChainId } from '../types'
import { useChainId } from './useChainId'
import { useConstantNext } from './useConstants'
import { CONSTANTS } from '../constants'
import { useAsyncRetry } from 'react-use'

//#region Ether
export interface NativeToken {
    type: EthereumTokenType.Native
    address: string
    chainId: ChainId
}

export interface NativeTokenDetailed extends NativeToken {
    name: 'Ether'
    symbol: 'ETH'
    decimals: 18
}
//#endregion
export function useNativeTokenDetailed() {
    const chainId = useChainId()
    const NATIVE_TOKEN_ADDRESS = useConstantNext(CONSTANTS).NATIVE_TOKEN_ADDRESS
    return useAsyncRetry<NativeTokenDetailed>(async () => ({
        type: EthereumTokenType.Native,
        address: NATIVE_TOKEN_ADDRESS,
        chainId,
        name: 'Ether',
        symbol: 'ETH',
        decimals: 18,
    }))
}
