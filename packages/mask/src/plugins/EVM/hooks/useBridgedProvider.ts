import { useMemo } from 'react'
import { unreachable } from '@dimensiondev/kit'
import { bridgedCoin98Provider, bridgedEthereumProvider } from '@masknet/injected-script'
import { ProviderType } from '@masknet/web3-shared-evm'

export function useBridgedProvider(type: ProviderType) {
    return useMemo(() => {
        switch (type) {
            case ProviderType.MetaMask:
            case ProviderType.MathWallet:
            case ProviderType.WalletLink:
                return bridgedEthereumProvider
            case ProviderType.Coin98:
                return bridgedCoin98Provider
            case ProviderType.MaskWallet:
            case ProviderType.CustomNetwork:
            case ProviderType.Fortmatic:
            case ProviderType.WalletConnect:
                throw new Error('Not implemented.')
            default:
                unreachable(type)
        }
    }, [type])
}
