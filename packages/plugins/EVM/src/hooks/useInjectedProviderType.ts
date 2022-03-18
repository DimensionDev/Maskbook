import { useAsyncRetry } from 'react-use'
import { ProviderType } from '@masknet/web3-shared-evm'
import { useInjectedProvider } from './useInjectedProvider'
import { useInjectedProviderReady } from './useInjectedProviderReady'

export function useInjectedProviderType(
    type: ProviderType.MetaMask | ProviderType.Coin98 | ProviderType.MathWallet | ProviderType.WalletLink,
) {
    const injectedProvider = useInjectedProvider(type)
    const injectedProviderReady = useInjectedProviderReady(type)
    const { value: injectedProviderType } = useAsyncRetry(async () => {
        if (!injectedProviderReady) return

        // WalletLink (Coinbase)
        const isWalletLink = await injectedProvider.getProperty('isWalletLink')
        if (isWalletLink) return ProviderType.WalletLink

        // Coin98 under ethereum
        const isCoin98 = await injectedProvider.getProperty('isCoin98')
        if (isCoin98) return ProviderType.Coin98

        // mathwallet
        const isMathWallet = await injectedProvider.getProperty('isMathWallet')
        if (isMathWallet) return ProviderType.MathWallet

        // metamask
        const isMetaMask = await injectedProvider.getProperty('isMetaMask')
        if (isMetaMask) return ProviderType.MetaMask

        return
    }, [injectedProviderReady, injectedProvider])
    return injectedProviderType
}
