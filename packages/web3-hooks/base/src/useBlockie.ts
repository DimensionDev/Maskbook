import { useMemo } from 'react'
import { type BlockieOptions, create } from 'ethereum-blockies'

export function generateBlockie(address: string, options?: BlockieOptions) {
    try {
        return create({
            seed: address,
            color: '#dfe',
            bgcolor: '#aaa',
            ...options,
        }).toDataURL()
    } catch {
        return ''
    }
}

export function useBlockie(address: string, options?: BlockieOptions) {
    return useMemo(() => {
        return generateBlockie(address, options)
    }, [address])
}
