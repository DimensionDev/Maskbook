import { useMemo } from 'react'
import { useChainId } from '../hooks'
import { ChainId, Primitive } from '../types'

export interface Constants {
    [K: string]: { [K in keyof typeof ChainId]: Primitive | Primitive[] }
}

export function transform<T extends Constants>(constants: T, environment: Record<string, string> = {}) {
    type Entries = { [key in keyof T]: T[key]['Mainnet'] }
    return (chainId = ChainId.Mainnet) => {
        const chainName = ChainId[chainId] as keyof typeof ChainId
        const entries = Object.keys(constants).map((name: keyof T) => {
            let value = constants[name][chainName]
            if (Array.isArray(value)) {
                value = value.map((item) => {
                    if (typeof item === 'string') {
                        return replaceAll(item, environment)
                    }
                    return item
                })
            } else if (typeof value === 'string') {
                value = replaceAll(value, environment)
            }
            return [name, value] as [string, Primitive | Primitive[]]
        })
        return Object.freeze(Object.fromEntries(entries)) as Entries
    }
}

export function hookTransform<T>(getConstants: (chainId: ChainId) => T) {
    return function useConstants(chainId?: ChainId) {
        const current = useChainId()
        const finalChain = chainId ?? current
        return useMemo(() => getConstants(finalChain), [finalChain])
    }
}

function replaceAll(input: string, values: Record<string, string>) {
    return input.replace(/\$\{([^}]+)\}/g, (match, p1) => values[p1] ?? match)
}
