import { NetworkPluginID, useChainId } from '@masknet/plugin-infra'
import { useAsyncRetry } from 'react-use'
import { fetchToken } from '../apis'

export function useFetchToken(tokenId: number) {
    const chainId = useChainId(NetworkPluginID.PLUGIN_EVM)

    return useAsyncRetry(async () => {
        if (!tokenId) return null
        return fetchToken(chainId, tokenId)
    }, [chainId, tokenId])
}
