import type { ProviderType } from '@masknet/web3-shared-evm'
import { useAsyncRetry } from 'react-use'
import { useBridgedProvider } from './useBridgedProvider'

export function useInjectedProviderReady(
    providerType: ProviderType.MetaMask | ProviderType.Coin98 | ProviderType.MathWallet | ProviderType.WalletLink,
) {
    const bridgedProvider = useBridgedProvider(providerType)
    const { value: available = false } = useAsyncRetry(async () => {
        return bridgedProvider.untilAvailable()
    }, [bridgedProvider])
    return available
}
