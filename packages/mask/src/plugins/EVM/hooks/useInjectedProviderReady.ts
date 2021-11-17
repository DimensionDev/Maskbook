import { useAsyncRetry } from 'react-use'
import { bridgedEthereumProvider } from '@masknet/injected-script'

export function useInjectedProviderReady() {
    const { value: available = false } = useAsyncRetry(async () => {
        return bridgedEthereumProvider.untilAvailable()
    }, [])
    return available
}
