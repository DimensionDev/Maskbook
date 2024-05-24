import { useCallback } from 'react'
import { createContainer } from '@masknet/shared-base-ui'
import { useWallets } from '@masknet/web3-hooks-base'
import { getDefaultWalletPassword, CrossIsolationMessages, PopupRoutes } from '@masknet/shared-base'
import { EVMWeb3 } from '@masknet/web3-providers'
import { ProviderType } from '@masknet/web3-shared-evm'
import Services from '#services'
import { useQueryClient } from '@tanstack/react-query'

function useContext() {
    const wallets = useWallets()
    const queryClient = useQueryClient()
    const resetWallets = useCallback(
        async (password: string | undefined, isReset: boolean | undefined) => {
            if (!isReset || !wallets.length || !password) return
            await Services.Wallet.resetPassword(password)
            await EVMWeb3.resetAllWallets?.({
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

            queryClient.removeQueries({ queryKey: ['@@has-password'] })

            if (isReset) {
                await resetWallets(password, isReset)
                if (isLocked && password) await Services.Wallet.unlockWallet(password)
            } else if (hasPassword && isLocked) {
                await Services.Helper.openPopupWindow(PopupRoutes.Wallet, {})
                return false
            } else if (password && !hasPassword) {
                await Services.Wallet.changePassword(getDefaultWalletPassword(), password)
            }
            return true
        },
        [resetWallets, queryClient],
    )

    return {
        resetWallets,
        handlePasswordAndWallets,
    }
}

export const ResetWalletContext = createContainer(useContext)
