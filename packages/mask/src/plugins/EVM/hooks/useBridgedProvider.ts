import { useMemo } from 'react'
import { unreachable } from '@dimensiondev/kit'
import { bridgedCoin98Provider, bridgedEthereumProvider } from '@masknet/injected-script'

export function useBridgedProvider(type: 'ethereum' | 'coin98') {
    return useMemo(() => {
        switch (type) {
            case 'ethereum':
                return bridgedEthereumProvider
            case 'coin98':
                return bridgedCoin98Provider
            default:
                unreachable(type)
        }
    }, [type])
}
