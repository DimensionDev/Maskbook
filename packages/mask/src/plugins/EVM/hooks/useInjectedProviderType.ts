import { useAsyncRetry } from 'react-use'
import { ProviderType } from '@masknet/web3-shared-evm'
import { bridgedEthereumProvider } from '@masknet/injected-script'
import { useInjectedProviderReady } from './useInjectedProviderReady'

export function useInjectedProviderType() {
    const injectedProviderReady = useInjectedProviderReady()
    const { value: injectedProviderType } = useAsyncRetry(async () => {
        if (!injectedProviderReady) return

        // WalletLink (Coinbase)
        const isWalletLink = await bridgedEthereumProvider.getProperty('isWalletLink')
        if (isWalletLink) return ProviderType.WalletLink

        // Coin98
        const isCoin98 = await bridgedEthereumProvider.getProperty('isCoin98')
        if (isCoin98) return ProviderType.Coin98

        // mathwallet
        const isMathWallet = await bridgedEthereumProvider.getProperty('isMathWallet')
        if (isMathWallet) return ProviderType.MathWallet

        // metamask
        const isMetaMask = await bridgedEthereumProvider.getProperty('isMetaMask')
        if (isMetaMask) return ProviderType.MetaMask

        return
    }, [injectedProviderReady])
    return injectedProviderType
}
