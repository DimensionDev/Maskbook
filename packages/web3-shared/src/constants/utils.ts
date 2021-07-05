import { useMemo } from 'react'
import { useChainId } from '../hooks'
import { ChainId, Primitive } from '../types'

export interface Constants {
    [K: string]: { [K in keyof typeof ChainId]: Primitive | Primitive[] }
}

export function transform<T extends Constants>(constants: T) {
    return (chainId = ChainId.Mainnet) => {
        const table = {} as { [key in keyof T]: T[key]['Mainnet'] }
        const chainName = ChainId[chainId] as keyof typeof ChainId
        for (const name in constants) {
            const key = name as keyof T
            table[key] = constants[key][chainName]
        }
        return Object.freeze(table)
    }
}

export function hookTransform<T>(getConstants: (chainId: ChainId) => T) {
    return function useConstants(chainId?: ChainId) {
        const current = useChainId()
        const finalChain = chainId ?? current
        return useMemo(() => getConstants(finalChain), [finalChain])
    }
}
