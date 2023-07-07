import { NetworkPluginID } from '@masknet/shared-base'
import { useFungibleAsset } from '@masknet/web3-hooks-base'
import { isSameAddress } from '@masknet/web3-shared-base'
import { useContainer } from 'unstated-next'
import { WalletContext } from './index.js'

// Use token from list first, to make sure data are Consistent
export function useAsset(address?: string, account?: string) {
    const { assets } = useContainer(WalletContext)
    const { data: token } = useFungibleAsset(NetworkPluginID.PLUGIN_EVM, address, { account })
    return assets.find((x) => isSameAddress(x.address, address)) || token
}
