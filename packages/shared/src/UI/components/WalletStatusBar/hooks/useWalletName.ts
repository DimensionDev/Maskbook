import { useMemo } from 'react'
import type { NetworkPluginID } from '@masknet/shared-base'
import {
    useChainContext,
    useReverseAddress,
    useProviderDescriptor,
    useWallets,
    useWeb3Others,
} from '@masknet/web3-hooks-base'
import { ProviderType } from '@masknet/web3-shared-evm'
import { isSameAddress, resolveNetworkWalletName } from '@masknet/web3-shared-base'

export const useWalletName = (
    expectedAccount?: string,
    expectedPluginId?: NetworkPluginID,
    isNextIdWallet?: boolean,
) => {
    const { account, providerType } = useChainContext({ account: expectedAccount })
    const { data: domain } = useReverseAddress(expectedPluginId, account)
    const wallets = useWallets()
    const providerDescriptor = useProviderDescriptor(expectedPluginId)
    const Others = useWeb3Others(expectedPluginId)

    return useMemo(() => {
        // Binding Wallet Just display domain and network name
        if (domain) return domain
        if (isNextIdWallet && expectedPluginId) return resolveNetworkWalletName(expectedPluginId)
        const wallet = wallets.find((x) => isSameAddress(x.address, expectedAccount ?? account))
        if (providerType === ProviderType.MaskWallet && wallet?.name) return wallet.name

        return providerDescriptor.name || Others.formatAddress(account, 4)
    }, [
        wallets,
        expectedAccount,
        providerType,
        domain,
        providerDescriptor.name,
        Others.formatAddress,
        account,
        isNextIdWallet,
        expectedPluginId,
    ])
}
