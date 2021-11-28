import { useAsyncRetry } from 'react-use'
import { bridgedEthereumProvider } from '@masknet/injected-script'

export function useInjectedProviderConnected() {
    const { value: injectedProviderConnected = false } = useAsyncRetry(async () => {
        return bridgedEthereumProvider.isConnected()
    }, [])
    return injectedProviderConnected
}
