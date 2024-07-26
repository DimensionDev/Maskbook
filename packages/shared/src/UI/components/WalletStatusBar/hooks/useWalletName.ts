import { useMemo } from 'react'
import { type NetworkPluginID } from '@masknet/shared-base'
import { useChainContext, useReverseAddress, useProviderDescriptor, useWeb3Utils } from '@masknet/web3-hooks-base'
import { resolveNetworkWalletName } from '@masknet/web3-shared-base'

export const useWalletName = (
    expectedAccount?: string,
    expectedPluginId?: NetworkPluginID,
    isNextIdWallet?: boolean,
) => {
    const { account, providerType } = useChainContext({ account: expectedAccount })
    const { data: domain } = useReverseAddress(expectedPluginId, account)
    const providerDescriptor = useProviderDescriptor(expectedPluginId)
    const Utils = useWeb3Utils(expectedPluginId)

    return useMemo(() => {
        // Binding Wallet Just display domain and network name
        if (domain) return domain
        if (isNextIdWallet && expectedPluginId) return resolveNetworkWalletName(expectedPluginId)

        return providerDescriptor?.name || Utils.formatAddress(account, 4)
    }, [
        expectedAccount,
        providerType,
        domain,
        providerDescriptor?.name,
        Utils.formatAddress,
        account,
        isNextIdWallet,
        expectedPluginId,
    ])
}
