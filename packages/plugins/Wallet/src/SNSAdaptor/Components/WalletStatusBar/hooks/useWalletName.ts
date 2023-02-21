import { useMemo } from 'react'
import type { NetworkPluginID } from '@masknet/shared-base'
import {
    useWallet,
    useChainContext,
    useReverseAddress,
    useWeb3State,
    useProviderDescriptor,
} from '@masknet/web3-hooks-base'
import { ProviderType } from '@masknet/web3-shared-evm'
import { resolveNetworkWalletName } from '@masknet/web3-shared-base'

export const useWalletName = (
    expectedAccount?: string,
    expectedPluginId?: NetworkPluginID,
    isNextIdWallet?: boolean,
) => {
    const { Others } = useWeb3State(expectedPluginId)
    const { account, providerType } = useChainContext({ account: expectedAccount })
    const { value: domain } = useReverseAddress(expectedPluginId, account)
    const wallet = useWallet(expectedPluginId)
    const providerDescriptor = useProviderDescriptor(expectedPluginId)

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
