import { useMemo } from 'react'
import type { NetworkPluginID } from '@masknet/shared-base'
import {
    useWallet,
    useAccount,
    useReverseAddress,
    useWeb3State,
    useProviderType,
    useProviderDescriptor,
} from '@masknet/web3-hooks-base'
import { ProviderType } from '@masknet/web3-shared-evm'
import { resolveNetworkWalletName } from '@masknet/web3-shared-base'

export const useWalletName = (
    expectedAccount?: string,
    expectedPluginId?: NetworkPluginID,
    isNextIdWallet?: boolean,
) => {
    const account = useAccount(expectedPluginId, expectedAccount)
    const wallet = useWallet(expectedPluginId)

    const { value: domain } = useReverseAddress(account, expectedPluginId)

    const { Others } = useWeb3State(expectedPluginId)
    const providerDescriptor = useProviderDescriptor(expectedPluginId)
    const providerType = useProviderType(expectedPluginId)

    return useMemo(() => {
        // Binding Wallet Just display domain and network name
        if (domain) return domain
        if (isNextIdWallet && expectedPluginId) return resolveNetworkWalletName(expectedPluginId)
        if (providerType === ProviderType.MaskWallet && wallet?.name) return wallet?.name

        return providerDescriptor?.name || Others?.formatAddress(account, 4)
    }, [
        providerType,
        domain,
        wallet?.name,
        providerDescriptor?.name,
        Others?.formatAddress,
        account,
        isNextIdWallet,
        expectedPluginId,
    ])
}
