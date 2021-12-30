import { useAsyncRetry } from 'react-use'
import { PluginGitcoinRPC } from '../messages'

export function useGrant(id: string) {
    return useAsyncRetry(() => PluginGitcoinRPC.fetchGrant(id))
}
