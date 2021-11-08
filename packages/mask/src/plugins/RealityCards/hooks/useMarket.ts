import { useRealityCardsConstants } from '@masknet/web3-shared-evm'
import { useAsyncRetry } from 'react-use'
import { PluginRealityCardsRPC } from '../messages'

export function useMarketBySlug(slug: string) {
    const { SUBGRAPH } = useRealityCardsConstants()
    return useAsyncRetry(() => PluginRealityCardsRPC.fetchMarketBySlug(SUBGRAPH, slug))
}
