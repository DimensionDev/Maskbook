import { useAsync } from 'react-use'
import type { ChainId } from '@masknet/web3-shared-evm'
import type { TradeProvider } from '@masknet/public-api'
import type { AsyncState } from 'react-use/lib/useAsyncFn'
import { PluginTraderRPC } from '../messages.js'
import type { TagType } from '../types/index.js'
import type { NetworkPluginID } from '@masknet/shared-base'
import { useChainContext } from '@masknet/web3-hooks-base'

export function useAvailableTraderProviders(
    type?: TagType,
    keyword?: string,
    targetChainId?: ChainId,
): AsyncState<TradeProvider[]> {
    const { chainId: currentChainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>()
    const chainId = targetChainId ?? currentChainId
    return useAsync(async () => {
        return PluginTraderRPC.getAvailableTraderProviders(chainId)
    }, [chainId, type, keyword])
}
