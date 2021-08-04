import { useAsync } from 'react-use'
import { useChainId } from '@masknet/web3-shared'
import { PluginTraderRPC } from '../messages'
import type { TagType, TradeProvider } from '../types'
import type { AsyncState } from 'react-use/lib/useAsyncFn'

export function useAvailableTraderProviders(type?: TagType, keyword?: string): AsyncState<TradeProvider[]> {
    const chainId = useChainId()
    return useAsync(async () => {
        return PluginTraderRPC.getAvailableTraderProviders(type, keyword)
    }, [chainId, type, keyword])
}
