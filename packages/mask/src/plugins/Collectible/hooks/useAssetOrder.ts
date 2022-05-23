import { useChainId } from '@masknet/plugin-infra/web3'
import { NetworkPluginID } from '@masknet/web3-shared-base'
import { useAsyncRetry } from 'react-use'
import { useOpenSeaSDK } from './useOpenSeaSDK'

export function useAssetOrder(address: string, tokenId: string) {
    const chainId = useChainId(NetworkPluginID.PLUGIN_EVM)
    const SDK = useOpenSeaSDK(chainId)
    return useAsyncRetry(async () => {
        return SDK?.api.getAsset({
            tokenAddress: address,
            tokenId,
        })
    }, [address, tokenId, SDK])
}
