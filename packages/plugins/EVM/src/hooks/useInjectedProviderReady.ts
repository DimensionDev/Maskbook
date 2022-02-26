import type { ProviderType } from '@masknet/web3-shared-evm'
import { useAsyncRetry } from 'react-use'
import { useInjectedProvider } from './useInjectedProvider'

export function useInjectedProviderReady(
    providerType: ProviderType.MetaMask | ProviderType.Coin98 | ProviderType.MathWallet | ProviderType.WalletLink,
) {
    const injectedProvider = useInjectedProvider(providerType)
    const { value: available = false } = useAsyncRetry(
        async () => injectedProvider.untilAvailable(),
        [injectedProvider],
    )
    return available
}
