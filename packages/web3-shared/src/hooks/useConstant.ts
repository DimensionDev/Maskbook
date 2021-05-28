import { useMemo } from 'react'
import { ChainId, Web3Constants } from '../types'
import { useChainId } from './useChainId'

export function useConstant<T extends Web3Constants, K extends keyof T>(constant: T, key: K, chainId?: ChainId) {
    const chainId_ = useChainId()
    return pick(constant, key, chainId ?? chainId_)
}

export function useConstantNext<T extends Web3Constants>(constants: T, chainId?: ChainId) {
    const current = useChainId()
    const finalChain = chainId ?? current
    return useMemo(() => constantOfChain(constants, finalChain), [constants, finalChain])
}

export function constantOfChain<T extends Web3Constants>(constants: T, chainId: ChainId) {
    const chainSpecifiedConstant = {} as { [key in keyof T]: T[key][ChainId.Mainnet] }
    for (const i in constants) chainSpecifiedConstant[i] = constants[i][chainId]
    return chainSpecifiedConstant
}

function pick<T extends Web3Constants, K extends keyof T>(
    constants: T,
    key: K,
    chainId = ChainId.Mainnet,
): T[K][ChainId.Mainnet] {
    return constants[key][chainId]
}
