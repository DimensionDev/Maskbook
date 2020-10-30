import { create } from 'ethereum-blockies'
import { useMemo } from 'react'
import { EthereumAddress } from 'wallet.ts'

export function useBlockie(address: string) {
    return useMemo(() => {
        if (!EthereumAddress.isValid(address)) return ''
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
