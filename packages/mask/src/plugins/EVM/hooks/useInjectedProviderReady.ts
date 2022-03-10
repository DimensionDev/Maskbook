import type { ProviderType } from '@masknet/web3-shared-evm'
import { useAsyncRetry } from 'react-use'
import { useBridgedProvider } from './useBridgedProvider'

export function useInjectedProviderReady(type: ProviderType) {
    const bridgedProvider = useBridgedProvider(type)
    const { value: available = false } = useAsyncRetry(async () => {
        return bridgedProvider.untilAvailable()
    }, [bridgedProvider])
    return available
}
