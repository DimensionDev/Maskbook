import { useAsyncRetry } from 'react-use'
import { useBridgedProvider } from './useBridgedProvider'

export function useInjectedProviderReady(type: 'ethereum' | 'coin98') {
    const bridgedProvider = useBridgedProvider(type)
    const { value: available = false } = useAsyncRetry(async () => {
        return bridgedProvider.untilAvailable()
    }, [bridgedProvider])
    return available
}
