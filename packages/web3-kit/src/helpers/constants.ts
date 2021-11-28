import { useMemo } from 'react'
import type { Primitive } from '../types'

type ChainId = number

type ChainIdEnum = {
    [key in ChainId]: string
} & {
    [key in 'Mainnet']: number
}

export type Constant = {
    [key in 'Mainnet']?: Primitive | Primitive[]
}

export type Constants = Record<string, Constant>

export function transform<C extends ChainIdEnum, T extends Constants>(
    chainIdEnum: C,
    constants: T,
    environment: Record<string, string> = {},
) {
    type Entries = { [key in keyof T]?: T[key]['Mainnet'] }
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

export function transformFromJSON<T extends Constants>(
    chainIdEnum: ChainIdEnum,
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

export function hookTransform<T>(getConstants: (chainId: ChainId) => Partial<T>) {
    return function useConstants(chainId: ChainId) {
        return useMemo(() => getConstants(chainId), [chainId])
    }
}

function replaceAll(input: string, values: Record<string, string>) {
    return input.replace(/\${([^}]+)}/g, (match, p1) => values[p1] ?? match)
}
