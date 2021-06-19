import { useChainId } from '@dimensiondev/web3-shared'
import { useAsync } from 'react-use'
import { PluginTraderRPC } from '../messages'
import type { TagType } from '../types'

export function useAvailableTraderProviders(type?: TagType, keyword?: string) {
    const chainId = useChainId()
    return useAsync(async () => {
        return PluginTraderRPC.getAvailableTraderProviders(type, keyword)
    }, [chainId, type, keyword])
}
