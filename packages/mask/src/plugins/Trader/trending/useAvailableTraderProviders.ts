import { useAsync } from 'react-use'
import type { ChainId } from '@masknet/web3-shared-evm'
import type { TradeProvider } from '@masknet/public-api'
import type { AsyncState } from 'react-use/lib/useAsyncFn.js'
import { PluginTraderRPC } from '../messages.js'
import type { TagType } from '../types/index.js'
import type { NetworkPluginID } from '@masknet/shared-base'
import { useChainContext } from '@masknet/web3-hooks-base'

export function useAvailableTraderProviders(
    type?: TagType,
    keyword?: string,
    targetChainId?: ChainId,
): AsyncState<TradeProvider[]> {
    const { chainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>({
        chainId: targetChainId,
    })
    return useAsync(async () => {
        return PluginTraderRPC.getAvailableTraderProviders(chainId)
    }, [chainId, type, keyword])
}
