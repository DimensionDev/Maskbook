import { useAsyncRetry } from 'react-use'
import { useChainId } from '../../../web3/hooks/useChainState'
import { PluginCollectibleRPC } from '../messages'
import type { CollectibleToken } from '../UI/types'

export function useAsset(token?: CollectibleToken) {
    const chainId = useChainId()

    return useAsyncRetry(async () => {
        if (!token) return
        return PluginCollectibleRPC.getAsset(token.contractAddress, token.tokenId)
    }, [chainId])
}
