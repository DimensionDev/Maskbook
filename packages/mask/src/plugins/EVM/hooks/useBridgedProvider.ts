import { useMemo } from 'react'
import { unreachable } from '@dimensiondev/kit'
import WalletConnectSDK from '@masknet/web3-shared-evm/providers/WalletConnect'
import FortmaticSDK from '@masknet/web3-shared-evm/providers/Fortmatic'
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
            case ProviderType.WalletConnect:
                return WalletConnectSDK
            case ProviderType.Fortmatic:
                return FortmaticSDK
            case ProviderType.MaskWallet:
                return
            case ProviderType.CustomNetwork:
                return
            default:
                unreachable(type)
        }
    }, [type])
}
