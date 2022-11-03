import { useAsyncRetry } from 'react-use'
import { useChainContext } from '@masknet/web3-hooks-base'
import type { NetworkPluginID } from '@masknet/shared-base'
import { fetchToken } from '../apis/index.js'

export function useFetchToken(tokenId: number) {
    const { chainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>()

    return useAsyncRetry(async () => {
        if (!tokenId) return null

        return fetchToken(chainId, tokenId)
    }, [chainId, tokenId])
}
