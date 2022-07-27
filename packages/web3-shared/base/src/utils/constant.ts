import { useMemo } from 'react'
import type { ChainIdEnum, Constants, Primitive } from './types'

export function transform<ChainId extends number, T extends Constants>(
    chainIdEnum: ChainIdEnum<ChainId>,
    constants: T,
    environment: Record<string, string> = {},
) {
    type Entries = { [key in keyof T]?: T[key]['Mainnet'] }
    return (chainId: ChainId = 1 as ChainId) => {
        const chainName = chainIdEnum[chainId] as 'Mainnet'
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

export function transformFromConstants<ChainId extends number, T extends Constants>(
    getter: (chainId: ChainId) => Constants[ChainId],
) {
    return (chainId: ChainId, key: keyof Constants[ChainId]) => {
        return getter(chainId)[key]
    }
}

export function transformFromJSON<ChainId extends number, T extends Constants>(
    chainIdEnum: ChainIdEnum<ChainId>,
    json: string,
    fallbackConstants: T,
    environment: Record<string, string> = {},
) {
    try {
        const constants = JSON.parse(json) as T
        return transform(chainIdEnum, constants, environment)
    } catch {
        return transform(chainIdEnum, fallbackConstants, environment)
    }
}

export function hookTransform<ChainId extends number, T>(getConstants: (chainId: ChainId) => Partial<T>) {
    return function useConstants(chainId: ChainId = 1 as ChainId) {
        return useMemo(() => getConstants(chainId), [chainId])
    }
}

function replaceAll(input: string, values: Record<string, string>) {
    return input.replace(/\${([^}]+)}/g, (match, p1) => values[p1] ?? match)
}
