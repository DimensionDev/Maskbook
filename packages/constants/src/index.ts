import { ChainId, useChainId } from '@dimensiondev/web3-shared'
import { useMemo } from 'react'
import trade from './trade-constants.json'

export const getTradeConstants = (chainId = ChainId.Mainnet) => {
    type Constants = typeof trade
    type Table = { [key in keyof Constants]: Constants[key]['Mainnet'] }

    const table = {} as Table
    const chainName = ChainId[chainId] as keyof typeof ChainId
    for (const name in trade) {
        const key = name as keyof Constants
        table[key] = trade[key][chainName]
    }
    return Object.freeze(table)
}

export const useTradeConstants = hookTransform(getTradeConstants)

function hookTransform<T>(getConstants: (chainId: ChainId) => T) {
    return function useConstants(chainId = ChainId.Mainnet) {
        const current = useChainId()
        const finalChain = chainId ?? current
        return useMemo(() => getConstants(finalChain), [finalChain])
    }
}
