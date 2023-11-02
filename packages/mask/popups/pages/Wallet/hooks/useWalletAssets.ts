import { NetworkPluginID } from '@masknet/shared-base'
import { useChainContext, useFungibleAssets } from '@masknet/web3-hooks-base'

export function useWalletAssets() {
    const { chainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>()
    return useFungibleAssets(NetworkPluginID.PLUGIN_EVM, undefined, { chainId })
}
