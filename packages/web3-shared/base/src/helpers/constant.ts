import { useMemo } from 'react'
import type { ChainIdEnum, Constants, Primitive } from './types.js'

function replaceAll(input: string, values: Record<string, string>) {
    if (!input.includes('${')) return input
    return input.replaceAll(/\${([^}]+)}/g, (match, p1) => values[p1] ?? match)
}

export function transformAll<ChainId extends number, T extends Constants>(
    chainIdEnum: ChainIdEnum<ChainId>,
    constants: T,
    environment: Record<string, string> = {},
) {
    type Entries = Readonly<{
        [key in keyof T]?: T[key]['Mainnet']
    }>
    return (chainId: ChainId = 1 as ChainId) => {
        const chainName = chainIdEnum[chainId] as 'Mainnet'
        // unknown chain id
        if (!chainName) return {} as Entries
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
        return Object.fromEntries(entries) as Entries
    }
}

export function transform<ChainId extends number, T extends Constants>(
    chainIdEnum: ChainIdEnum<ChainId>,
    constants: T,
    environment: Record<string, string> = {},
) {
    type Entries = {
        [key in keyof T]?: T[key]['Mainnet']
    }
    const getAllConstants = transformAll(chainIdEnum, constants, environment)
    return <K extends keyof Entries, F extends Entries[K], R = F extends undefined ? Entries[K] : Required<Entries>[K]>(
        chainId: ChainId,
        key: K,
        fallback?: F,
    ) => (getAllConstants(chainId)[key] ?? fallback) as R
}

export function transformAllHook<ChainId extends number, T>(getConstants: (chainId: ChainId) => Partial<T>) {
    return function useConstants(chainId: ChainId = 1 as ChainId) {
        return useMemo(() => getConstants(chainId), [chainId])
    }
}

export function transformHook<ChainId extends number, const T, const K extends keyof T>(
    getConstant: (chainId: ChainId) => Partial<T>,
) {
    return function useConstant<F extends K>(chainId: ChainId = 1 as ChainId, key?: F, fallback?: T[F]) {
        return useMemo(() => {
            if (!key) return fallback
            return getConstant(chainId)[key] ?? fallback
        }, [chainId])
    }
}
