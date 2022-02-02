import { useAsyncRetry } from 'react-use'
import { PluginShoyuRPC } from '../messages'

export function useFetchApi(shoyuUrl: string, subgraphsUrl: string | undefined) {
    return useAsyncRetry(() => PluginShoyuRPC.fetchApi(shoyuUrl, subgraphsUrl), [shoyuUrl, subgraphsUrl])
}
