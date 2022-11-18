import { useAsync } from 'react-use'
import type { AsyncState } from 'react-use/lib/useAsyncFn.js'
import type { DataProvider } from '@masknet/public-api'
import { ChainId } from '@masknet/web3-shared-evm'
import { EMPTY_LIST } from '@masknet/shared-base'
import { PluginTraderRPC } from '../messages.js'
import type { TagType } from '../types/index.js'

export function useAvailableDataProviders(
    chainId = ChainId.Mainnet,
    type?: TagType,
    keyword?: string,
): AsyncState<DataProvider[]> {
    return useAsync(async () => {
        if (!keyword) return EMPTY_LIST
        return PluginTraderRPC.getAvailableDataProviders(chainId, type, keyword)
    }, [chainId, type, keyword])
}
