import { useAsync } from 'react-use'
import { ChainId, useChainId } from '@masknet/web3-shared-evm'
import type { TradeProvider } from '@masknet/public-api'
import type { AsyncState } from 'react-use/lib/useAsyncFn'
import { PluginTraderRPC } from '../messages'
import type { TagType } from '../types'

export function useAvailableTraderProviders(
    type?: TagType,
    keyword?: string,
    targetChainId?: ChainId,
): AsyncState<TradeProvider[]> {
    const chainId = useChainId()
    return useAsync(async () => {
        return PluginTraderRPC.getAvailableTraderProviders(chainId)
    }, [chainId, type, keyword])
}
