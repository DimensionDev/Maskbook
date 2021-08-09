import { useMemo } from 'react'
import { BlockieOptions, create } from 'ethereum-blockies'

export function useBlockie(address: string, options?: BlockieOptions) {
    return useMemo(() => {
        const defaultOptions = {
            seed: address,
            color: '#dfe',
            bgcolor: '#aaa',
        }
        try {
            return create({ ...defaultOptions, ...options }).toDataURL()
        } catch {
            return ''
        }
    }, [address])
}
