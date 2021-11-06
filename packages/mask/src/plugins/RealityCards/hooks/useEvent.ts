import { useRealityCardsConstants } from '@masknet/web3-shared-evm'
import { useAsyncRetry } from 'react-use'
import { PluginRealityCardsRPC } from '../messages'

export function useEventBySlug(slug: string) {
    const { SUBGRAPH } = useRealityCardsConstants()
    return useAsyncRetry(() => PluginRealityCardsRPC.fetchEventBySlug(SUBGRAPH, slug))
}
