import { useCallback } from 'react'
import { createContainer } from 'unstated-next'
import { useWallets } from '@masknet/web3-hooks-base'
import { getDefaultWalletPassword, CrossIsolationMessages, PopupRoutes } from '@masknet/shared-base'
import { Web3 } from '@masknet/web3-providers'
import { ProviderType } from '@masknet/web3-shared-evm'
import Services from '#services'

function useContext() {
    const wallets = useWallets()

    const resetWallets = useCallback(
        async (password: string | undefined, isReset: boolean | undefined) => {
            if (!isReset || !wallets.length || !password) return
            await Services.Wallet.resetPassword(password)
            await Web3.resetAllWallets?.({
                providerType: ProviderType.MaskWallet,
            })
            CrossIsolationMessages.events.walletsUpdated.sendToAll(undefined)
        },
        [wallets.length],
    )

    const handlePasswordAndWallets = useCallback(
        async (password: string | undefined, isReset: boolean | undefined) => {
            const hasPassword = await Services.Wallet.hasPassword()

            if (!hasPassword) await Services.Wallet.setDefaultPassword()
            const isLocked = await Services.Wallet.isLocked()

            if (isReset) {
                await resetWallets(password, isReset)
            } else if (hasPassword && isLocked) {
                await Services.Helper.openPopupWindow(PopupRoutes.Unlock)
                return false
            } else if (password && !hasPassword) {
                await Services.Wallet.changePassword(getDefaultWalletPassword(), password)
            }
            return true
        },
        [resetWallets],
    )

    return {
        resetWallets,
        handlePasswordAndWallets,
    }
}

export const ResetWalletContext = createContainer(useContext)
