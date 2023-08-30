import { NetworkPluginID } from '@masknet/shared-base'
import { useQuery } from '@tanstack/react-query'
import { useWallet } from '@masknet/web3-hooks-base'
import Services from '../../service.js'

export function useConnectedSites() {
    const wallet = useWallet(NetworkPluginID.PLUGIN_EVM)
    return useQuery(['connectedSites', wallet?.address], async () => await Services.Wallet.getConnectedSites(), {
        enabled: !!wallet?.address,
    })
}
