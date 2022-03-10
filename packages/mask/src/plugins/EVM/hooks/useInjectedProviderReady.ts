import type { EthereumProvider } from '@masknet/injected-script'
import type { ProviderType } from '@masknet/web3-shared-evm'
import { useAsyncRetry } from 'react-use'
import { useBridgedProvider } from './useBridgedProvider'

export function useInjectedProviderReady(
    type: ProviderType.MetaMask | ProviderType.Coin98 | ProviderType.MathWallet | ProviderType.WalletLink,
) {
    const bridgedProvider = useBridgedProvider(type)
    const { value: available = false } = useAsyncRetry(async () => {
        return (bridgedProvider as EthereumProvider).untilAvailable()
    }, [bridgedProvider])
    return available
}
