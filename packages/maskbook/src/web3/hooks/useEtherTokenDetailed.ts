import { useAsyncRetry } from 'react-use'
import { CONSTANTS } from '../constants'
import { NativeTokenDetailed, EthereumTokenType } from '../types'
import { useChainId } from './useChainId'
import { useConstant } from './useConstant'

export function useEtherTokenDetailed() {
    const chainId = useChainId()
    const ETH_ADDRESS = useConstant(CONSTANTS, 'ETH_ADDRESS')
    return useAsyncRetry(async () => {
        return {
            type: EthereumTokenType.Native,
            address: ETH_ADDRESS,
            chainId,
            name: 'Ether',
            symbol: 'ETH',
            decimals: 18,
        } as NativeTokenDetailed
    }, [chainId, ETH_ADDRESS])
}
