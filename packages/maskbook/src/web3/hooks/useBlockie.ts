import { create } from 'ethereum-blockies'
import { useMemo } from 'react'

export function useBlockie(address: string) {
    return useMemo(() => {
        try {
            return create({
                seed: address,
                color: '#dfe',
                bgcolor: '#aaa',
            }).toDataURL()
        } catch (e) {
            return ''
        }
    }, [address])
}
