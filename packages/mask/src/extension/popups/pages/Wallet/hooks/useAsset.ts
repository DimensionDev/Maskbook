import { NetworkPluginID } from '@masknet/shared-base'
import { useFungibleAsset } from '@masknet/web3-hooks-base'
import { isSameAddress } from '@masknet/web3-shared-base'
import { useContainer } from 'unstated-next'
import { WalletContext } from './index.js'
import { isNativeTokenAddress, type ChainId } from '@masknet/web3-shared-evm'

// Use token from list first, to make sure data is consistent
export function useAsset(chainId: ChainId, address?: string, account?: string) {
    const { assets } = useContainer(WalletContext)
    const { data: asset } = useFungibleAsset(NetworkPluginID.PLUGIN_EVM, address, { account, chainId })
    const matchedAsset = assets.find((x) => {
        if (x.chainId !== chainId) return false
        return isNativeTokenAddress(address) || isSameAddress(x.address, address)
    })
    return matchedAsset || asset
}
