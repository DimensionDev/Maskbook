import { NetworkPluginID } from '@masknet/shared-base'
import { useFungibleAsset } from '@masknet/web3-hooks-base'
import { isSameAddress } from '@masknet/web3-shared-base'
import { type ChainId } from '@masknet/web3-shared-evm'
import { useWalletAssets } from './useWalletAssets.js'

// Use token from list first, to make sure data is consistent
export function useAsset(chainId: ChainId, address?: string, account?: string) {
    const [assets] = useWalletAssets()
    const { data: asset } = useFungibleAsset(NetworkPluginID.PLUGIN_EVM, address, { account, chainId })
    const matchedAsset = assets.find((x) => {
        if (x.chainId !== chainId) return false
        return isSameAddress(x.address, address)
    })
    return matchedAsset || asset
}
