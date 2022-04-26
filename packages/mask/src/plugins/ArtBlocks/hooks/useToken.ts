import { useAsyncRetry } from 'react-use'
import { useChainId } from '@masknet/plugin-infra/web3'
import { NetworkPluginID } from '@masknet/web3-shared-base'
import { fetchToken } from '../apis'

export function useFetchToken(tokenId: number) {
    const chainId = useChainId(NetworkPluginID.PLUGIN_EVM)

    return useAsyncRetry(async () => {
        if (!tokenId) return null
        return fetchToken(chainId, tokenId)
    }, [chainId, tokenId])
}
