import { useMemo } from 'react'
import { useChainId } from '../hooks'
import { ChainId, Primitive } from '../types'

export type Constant = {
    [K in keyof typeof ChainId]?: Primitive | Primitive[]
}

export type Constants = Record<string, Constant>

export function transform<T extends Constants>(constants: T, environment: Record<string, string> = {}) {
    type Entries = { [key in keyof T]?: T[key]['Mainnet'] }
    return (chainId: number = ChainId.Mainnet) => {
        const chainName = ChainId[chainId] as keyof typeof ChainId | undefined
        // unknown chain id
        if (!chainName) return Object.freeze({}) as Entries
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

export function transformFromJSON<T extends Constants>(
    json: string,
    fallbackConstants: T,
    environment: Record<string, string> = {},
) {
    try {
        const constants = JSON.parse(json) as T
        return transform(constants, environment)
    } catch {
        return transform(fallbackConstants, environment)
    }
}

export function hookTransform<T>(getConstants: (chainId: ChainId) => Partial<T>) {
    return function useConstants(chainId?: number) {
        const currentChainId = useChainId()
        const finalChainId = chainId ?? currentChainId
        return useMemo(() => getConstants(finalChainId), [finalChainId])
    }
}

function replaceAll(input: string, values: Record<string, string>) {
    return input.replace(/\${([^}]+)}/g, (match, p1) => values[p1] ?? match)
}
