import { useAsyncRetry } from 'react-use'
import { ProviderType } from '@masknet/web3-shared-evm'
import { useBridgedProvider } from './useBridgedProvider'
import { useInjectedProviderReady } from './useInjectedProviderReady'

export function useInjectedProviderType(type: 'ethereum' | 'coin98') {
    const bridgedProvider = useBridgedProvider(type)
    const injectedProviderReady = useInjectedProviderReady(type)
    const { value: injectedProviderType } = useAsyncRetry(async () => {
        if (!injectedProviderReady) return

        // WalletLink (Coinbase)
        const isWalletLink = await bridgedProvider.getProperty('isWalletLink')
        if (isWalletLink) return ProviderType.WalletLink

        // Coin98 under ethereum
        const isCoin98 = await bridgedProvider.getProperty('isCoin98')
        if (isCoin98) return ProviderType.Coin98

        // mathwallet
        const isMathWallet = await bridgedProvider.getProperty('isMathWallet')
        if (isMathWallet) return ProviderType.MathWallet

        // metamask
        const isMetaMask = await bridgedProvider.getProperty('isMetaMask')
        if (isMetaMask) return ProviderType.MetaMask

        return
    }, [injectedProviderReady, bridgedProvider])
    return injectedProviderType
}
