import { evmAddress } from '@lens-protocol/client'
import type { NetworkPluginID } from '@masknet/shared-base'
import { useChainContext } from '@masknet/web3-hooks-base'
import { useQuery } from '@tanstack/react-query'
import { useLensClient } from './useLensClient.js'

export function useAvailableLensAccounts() {
    const { account: walletAccount } = useChainContext<NetworkPluginID.PLUGIN_EVM>()
    const lensClient = useLensClient()

    return useQuery({
        queryKey: ['lens', 'available-accounts', !lensClient, walletAccount],
        queryFn: async () => {
            if (!walletAccount || !lensClient) return null
            const accounts = await lensClient.getAvailableAccounts(evmAddress(walletAccount))
            return accounts
        },
    })
}
