import { useAsyncRetry } from 'react-use'
import { bridgedEthereumProvider } from '@masknet/injected-script'
import { InjectedProviderType } from '@masknet/web3-shared-evm'
import { useInjectedProviderReady } from '.'

export function useInjectedProviderType() {
    const injectedProviderReady = useInjectedProviderReady()
    const { value: injectedProviderType = InjectedProviderType.Unknown } = useAsyncRetry(async () => {
        if (!injectedProviderReady) return InjectedProviderType.Unknown

        // WalletLink (Coinbase)
        const isWalletLink = await bridgedEthereumProvider.getProperty('isWalletLink')
        if (isWalletLink) return InjectedProviderType.WalletLink

        // Coin98
        const isCoin98 = await bridgedEthereumProvider.getProperty('isCoin98')
        if (isCoin98) return InjectedProviderType.Coin98

        // mathwallet
        const isMathWallet = await bridgedEthereumProvider.getProperty('isMathWallet')
        if (isMathWallet) return InjectedProviderType.MathWallet

        // metamask
        const isMetaMask = await bridgedEthereumProvider.getProperty('isMetaMask')
        if (isMetaMask) return InjectedProviderType.MetaMask

        return InjectedProviderType.Unknown
    }, [injectedProviderReady])
    return injectedProviderType
}
