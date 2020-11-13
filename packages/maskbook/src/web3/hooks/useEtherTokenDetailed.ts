import { useAsyncRetry } from 'react-use'
import { CONSTANTS } from '../constants'
import { EtherTokenDetailed, EthereumTokenType } from '../types'
import { useChainId } from './useChainState'
import { useConstant } from './useConstant'

export function useEtherTokenDetailed() {
    const chainId = useChainId()
    const ETH_ADDRESS = useConstant(CONSTANTS, 'ETH_ADDRESS')
    return useAsyncRetry(async () => {
        return {
            type: EthereumTokenType.Ether,
            address: ETH_ADDRESS,
            chainId,
            name: 'Ether',
            symbol: 'ETH',
            decimals: 18,
        } as EtherTokenDetailed
    }, [chainId, ETH_ADDRESS])
}
