import { useMemo } from 'react'
import { unreachable } from '@dimensiondev/kit'
import { injectedCoin98Provider, injectedEthereumProvider } from '@masknet/injected-script'
import { ProviderType } from '@masknet/web3-shared-evm'

export function useInjectedProvider(
    type: ProviderType.MetaMask | ProviderType.Coin98 | ProviderType.MathWallet | ProviderType.WalletLink,
) {
    return useMemo(() => {
        switch (type) {
            case ProviderType.MetaMask:
            case ProviderType.WalletLink:
            case ProviderType.MathWallet:
                return injectedEthereumProvider
            case ProviderType.Coin98:
                return injectedCoin98Provider
            default:
                unreachable(type)
        }
    }, [type])
}
