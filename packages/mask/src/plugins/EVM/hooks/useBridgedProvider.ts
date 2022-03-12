import { useMemo } from 'react'
import { unreachable } from '@dimensiondev/kit'
import { bridgedCoin98Provider, bridgedEthereumProvider } from '@masknet/injected-script'
import { ProviderType } from '@masknet/web3-shared-evm'

export function useBridgedProvider(
    type: ProviderType.MetaMask | ProviderType.Coin98 | ProviderType.MathWallet | ProviderType.WalletLink,
) {
    return useMemo(() => {
        switch (type) {
            case ProviderType.MetaMask:
            case ProviderType.WalletLink:
            case ProviderType.MathWallet:
                return bridgedEthereumProvider
            case ProviderType.Coin98:
                return bridgedCoin98Provider
            default:
                unreachable(type)
        }
    }, [type])
}
