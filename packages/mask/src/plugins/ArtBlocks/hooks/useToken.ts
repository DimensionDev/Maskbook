import { useAsyncRetry } from 'react-use'
import { NetworkPluginID, useChainId } from '@masknet/plugin-infra/web3'
import type { ChainId } from '@masknet/web3-shared-evm'
import { fetchToken } from '../apis'

export function useFetchToken(tokenId: number) {
    const chainId = useChainId<ChainId>(NetworkPluginID.PLUGIN_EVM)

    return useAsyncRetry(async () => {
        if (!tokenId) return null
        return fetchToken(chainId, tokenId)
    }, [chainId, tokenId])
}
