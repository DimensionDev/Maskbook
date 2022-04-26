import { useMemo } from 'react'
import type { ChainIdEnum, Constants, Primitive } from './types'

export function transform<ChainId extends number, T extends Constants>(
    chainIdEnum: ChainIdEnum<ChainId>,
    constants: T,
    environment: Record<string, string> = {},
) {
    type Entries = { [key in keyof T]?: T[key]['Mainnet'] }

    // @ts-ignore
    return (chainId: ChainId = 1) => {
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
    // @ts-ignore
    return function useConstants(chainId: ChainId = 1) {
        return useMemo(() => getConstants(chainId), [chainId])
    }
}

function replaceAll(input: string, values: Record<string, string>) {
    return input.replace(/\${([^}]+)}/g, (match, p1) => values[p1] ?? match)
}
