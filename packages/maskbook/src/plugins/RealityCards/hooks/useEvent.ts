import { useAsyncRetry } from 'react-use'
import { API_URL } from '../constants'
import { PluginRealityCardsRPC } from '../messages'

export function useEvent(slug: string) {
    return useAsyncRetry(() => PluginRealityCardsRPC.fetchEvent(API_URL, slug))
}
