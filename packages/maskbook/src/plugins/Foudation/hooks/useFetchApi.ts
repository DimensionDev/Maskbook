import { useAsyncRetry } from 'react-use'
import { PluginFoundationRPC } from '../messages'

export function useFetchApi(foudationUrl: string, subgraphsUrl: string | undefined) {
    return useAsyncRetry(() => PluginFoundationRPC.fetchApi(foudationUrl, subgraphsUrl))
}
