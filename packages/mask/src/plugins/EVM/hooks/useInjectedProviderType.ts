import { useAsyncRetry } from 'react-use'
import { ProviderType } from '@masknet/web3-shared-evm'
import type { EthereumProvider } from '@masknet/injected-script'
import { useBridgedProvider } from './useBridgedProvider'
import { useInjectedProviderReady } from './useInjectedProviderReady'

export function useInjectedProviderType(
    type: ProviderType.MetaMask | ProviderType.Coin98 | ProviderType.MathWallet | ProviderType.WalletLink,
) {
    const bridgedProvider = useBridgedProvider(type)
    const injectedProviderReady = useInjectedProviderReady(type)
    const { value: injectedProviderType } = useAsyncRetry(async () => {
        if (!injectedProviderReady) return

        const provier = bridgedProvider as EthereumProvider

        // WalletLink (Coinbase)
        const isWalletLink = await provier.getProperty('isWalletLink')
        if (isWalletLink) return ProviderType.WalletLink

        // Coin98 under ethereum
        const isCoin98 = await provier.getProperty('isCoin98')
        if (isCoin98) return ProviderType.Coin98

        // mathwallet
        const isMathWallet = await provier.getProperty('isMathWallet')
        if (isMathWallet) return ProviderType.MathWallet

        // metamask
        const isMetaMask = await provier.getProperty('isMetaMask')
        if (isMetaMask) return ProviderType.MetaMask

        return
    }, [injectedProviderReady, bridgedProvider])
    return injectedProviderType
}
