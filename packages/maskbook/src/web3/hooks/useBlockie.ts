import { BlockieOptions, create } from 'ethereum-blockies'
import { useMemo } from 'react'

export function useBlockie(address: string, options?: BlockieOptions) {
    return useMemo(() => {
        const defaultOptions = {
            seed: address,
            color: '#dfe',
            bgcolor: '#aaa',
        }
        try {
            return create({ ...defaultOptions, ...options }).toDataURL()
        } catch (e) {
            return ''
        }
    }, [address])
}
