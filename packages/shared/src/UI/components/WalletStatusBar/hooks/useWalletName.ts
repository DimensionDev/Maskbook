import { useMemo } from 'react'
import { type NetworkPluginID } from '@masknet/shared-base'
import { useChainContext, useReverseAddress, useWeb3Utils } from '@masknet/web3-hooks-base'
import { resolveNetworkWalletName } from '@masknet/web3-shared-base'

export const useWalletName = (
    expectedAccount?: string,
    expectedPluginId?: NetworkPluginID,
    isNextIdWallet?: boolean,
) => {
    const { account } = useChainContext({ account: expectedAccount })
    const { data: domain } = useReverseAddress(expectedPluginId, account)
    const Utils = useWeb3Utils(expectedPluginId)

    return useMemo(() => {
        // Binding Wallet Just display domain and network name
        if (domain) return domain
        if (isNextIdWallet && expectedPluginId) return resolveNetworkWalletName(expectedPluginId)

        return Utils.formatAddress(account, 4)
    }, [expectedAccount, domain, Utils.formatAddress, account, isNextIdWallet, expectedPluginId])
}
