import { useAsyncRetry } from 'react-use'
import { useChainId } from '@masknet/web3-hooks-base'
import { NetworkPluginID } from '@masknet/web3-shared-base'
import { fetchToken } from '../apis/index.js'

export function useFetchToken(tokenId: number) {
    const chainId = useChainId(NetworkPluginID.PLUGIN_EVM)

    return useAsyncRetry(async () => {
        if (!tokenId) return null

        return fetchToken(chainId, tokenId)
    }, [chainId, tokenId])
}
