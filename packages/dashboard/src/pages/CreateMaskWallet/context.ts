import { useCallback } from 'react'
import { createContainer } from 'unstated-next'
import { useLocation } from 'react-router-dom'
import { useWallets } from '@masknet/web3-hooks-base'
import { getDefaultWalletPassword, CrossIsolationMessages } from '@masknet/shared-base'
import { Web3 } from '@masknet/web3-providers'
import { ProviderType } from '@masknet/web3-shared-evm'
import { WalletServiceRef } from '@masknet/plugin-infra/dom'

function useContext() {
    const location = useLocation()
    const wallets = useWallets()

    const resetWallets = useCallback(
        async (password: string | undefined, isReset: boolean | undefined) => {
            if (!(isReset && wallets.length && password)) return
            await WalletServiceRef.value.resetPassword(password)
            await Web3.resetAllWallets?.({
                providerType: ProviderType.MaskWallet,
            })
            CrossIsolationMessages.events.walletsUpdated.sendToAll(undefined)
        },
        [wallets.length],
    )

    const handlePasswordAndWallets = useCallback(
        async (password: string | undefined, isReset: boolean | undefined) => {
            const hasPassword = await WalletServiceRef.value.hasPassword()
            if (!hasPassword) await WalletServiceRef.value.setDefaultPassword()

            if (isReset) {
                await resetWallets(password, isReset)
            } else if (password && !hasPassword) {
                await WalletServiceRef.value.changePassword(getDefaultWalletPassword(), password)
            }
        },
        [resetWallets],
    )

    return {
        resetWallets,
        handlePasswordAndWallets,
    }
}

export const ResetWalletContext = createContainer(useContext)
