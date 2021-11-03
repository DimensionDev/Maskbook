import { useAsyncRetry } from 'react-use'
import { PluginFurucomboRPC } from '../messages'

export function useFetchPools() {
    return useAsyncRetry(async () => PluginFurucomboRPC.fetchPools())
}
