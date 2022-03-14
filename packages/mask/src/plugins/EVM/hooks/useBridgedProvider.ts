import { useMemo } from 'react'
import { unreachable } from '@dimensiondev/kit'
import { EIP1193Provider, ChainId, ProviderType } from '@masknet/web3-shared-evm'
import WalletConnectSDK from '@masknet/web3-shared-evm/providers/WalletConnect'
import FortmaticSDK from '@masknet/web3-shared-evm/providers/Fortmatic'
import InjectedSDK from '@masknet/web3-shared-evm/providers/Injected'
import { injectedCoin98Provider, injectedEthereumProvider } from '@masknet/injected-script'

type Provider = EIP1193Provider & {
    login: (chainId?: ChainId) => Promise<string[]>
    logout: (chainId?: ChainId) => Promise<void>
}

/**
 * Get an EIP-1193 compatible provider
 * @param type
 * @returns
 */
export function useBridgedProvider(type: ProviderType) {
    return useMemo<Provider | undefined>(() => {
        switch (type) {
            case ProviderType.MaskWallet:
                // not necessary for Mask Wallet to implement a bridged provider
                return
            case ProviderType.MetaMask:
            case ProviderType.MathWallet:
            case ProviderType.WalletLink:
                return new InjectedSDK(injectedEthereumProvider)
            case ProviderType.Coin98:
                return new InjectedSDK(injectedCoin98Provider)
            case ProviderType.WalletConnect:
                return new WalletConnectSDK()
            case ProviderType.Fortmatic:
                return new FortmaticSDK() as Provider
            case ProviderType.CustomNetwork:
                return
            default:
                unreachable(type)
        }
    }, [type])
}
