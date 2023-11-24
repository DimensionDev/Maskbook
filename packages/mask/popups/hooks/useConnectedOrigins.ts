import { NetworkPluginID } from '@masknet/shared-base'
import { useQuery } from '@tanstack/react-query'
import { useWallet } from '@masknet/web3-hooks-base'
import Services from '#services'

export function useConnectedOrigins() {
    const wallet = useWallet(NetworkPluginID.PLUGIN_EVM)
    return useQuery({
        queryKey: ['wallet-granted-origins', wallet?.address],
        queryFn: async () => await Services.Wallet.getAllConnectedOrigins(wallet!.address, 'any'),
        enabled: !!wallet?.address,
        networkMode: 'always',
    })
}
