import { useAsync } from 'react-use'
import { useChainId } from '@masknet/web3-shared'
import { PluginTraderRPC } from '../messages'
import type { TagType } from '../types'

export function useAvailableTraderProviders(type?: TagType, keyword?: string) {
    const chainId = useChainId()
    return useAsync(async () => {
        return PluginTraderRPC.getAvailableTraderProviders(type, keyword)
    }, [chainId, type, keyword])
}
