import { useMemo } from 'react'
import { CONSTANTS } from '../constants'
import { Token, EtherToken, EthereumTokenType } from '../types'
import { useChainId } from './useChainState'
import { useConstant } from './useConstant'

export function useEther(token?: PartialRequired<Token, 'type'>) {
    const chainId = useChainId()
    const ETH_ADDRESS = useConstant(CONSTANTS, 'ETH_ADDRESS')
    const token_ = useMemo(() => {
        if (token?.type !== EthereumTokenType.Ether) return
        return {
            type: EthereumTokenType.Ether,
            address: ETH_ADDRESS,
            chainId,
            name: 'Ether',
            symbol: 'ETH',
            decimals: 18,
        } as EtherToken
    }, [token?.type, chainId])
    return {
        error: null,
        loading: false,
        value: token_,
    }
}
