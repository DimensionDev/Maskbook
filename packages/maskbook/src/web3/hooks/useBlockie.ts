import { BlockieOptions, create } from 'ethereum-blockies'
import { useMemo } from 'react'

export function useBlockie(address: string, options_?: BlockieOptions) {
    return useMemo(() => {
        const options = {
            seed: address,
            color: '#dfe',
            bgcolor: '#aaa',
        }
        if (options_) Object.assign(options, options_)
        try {
            return create(options).toDataURL()
        } catch (e) {
            return ''
        }
    }, [address])
}
