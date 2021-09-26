import { useAsync } from 'react-use'
import { useChainId } from '@masknet/web3-shared'
import type { TradeProvider } from '@masknet/public-api'
import type { AsyncState } from 'react-use/lib/useAsyncFn'
import { PluginTraderRPC } from '../messages'
import type { TagType } from '../types'

export function useAvailableTraderProviders(type?: TagType, keyword?: string): AsyncState<TradeProvider[]> {
    const chainId = useChainId()
    return useAsync(async () => {
        return PluginTraderRPC.getAvailableTraderProviders(chainId)
    }, [chainId, type, keyword])
}
