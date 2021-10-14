import { useAsyncRetry } from 'react-use'
import { PluginFoundationRPC } from '../messages'

export function useFetchApi(foundationUrl: string, subgraphsUrl: string | undefined) {
    return useAsyncRetry(() => PluginFoundationRPC.fetchApi(foundationUrl, subgraphsUrl))
}
