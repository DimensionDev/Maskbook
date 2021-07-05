import { useAsync } from 'react-use'
import { useChainId } from '@masknet/web3-shared'
import { PluginTraderRPC } from '../messages'
import type { TagType } from '../types'

export function useAvailableDataProviders(type?: TagType, keyword?: string) {
    const chainId = useChainId()
    return useAsync(async () => {
        return PluginTraderRPC.getAvailableDataProviders(type, keyword)
    }, [chainId, type, keyword])
}
