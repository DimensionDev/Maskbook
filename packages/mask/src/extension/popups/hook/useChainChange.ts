import { useCallback } from 'react'
import { ProviderType } from '@masknet/public-api'
import { WalletRPC } from '../../../plugins/Wallet/messages'
import { currentMaskWalletAccountSettings, currentProviderSettings } from '../../../plugins/Wallet/settings'
import type { ChainId } from '@masknet/web3-shared-evm'
import { useValueRef } from '@masknet/shared-base-ui'
import { useAccount } from '@masknet/web3-shared-evm'

export const useChainChange = () => {
    const providerType = useValueRef(currentProviderSettings)
    const account = useAccount()
    return useCallback(
        async (chainId: ChainId) => {
            if (providerType === ProviderType.MaskWallet) {
                await WalletRPC.updateAccount({
                    chainId,
                })
            }
            return WalletRPC.updateMaskAccount({
                chainId,
                account: currentMaskWalletAccountSettings.value,
            })
        },
        [providerType, account],
    )
}
