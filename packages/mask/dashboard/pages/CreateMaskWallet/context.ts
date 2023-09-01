import { useCallback } from 'react'
import { createContainer } from 'unstated-next'
import { useWallets } from '@masknet/web3-hooks-base'
import { getDefaultWalletPassword, CrossIsolationMessages, PopupRoutes } from '@masknet/shared-base'
import { Web3 } from '@masknet/web3-providers'
import { ProviderType } from '@masknet/web3-shared-evm'
import { WalletServiceRef } from '@masknet/plugin-infra/dom'
import { Services } from '../../API.js'

function useContext() {
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
            const isLocked = await WalletServiceRef.value.isLocked()

            if (hasPassword && isLocked) {
                await Services.Helper.openPopupWindow(PopupRoutes.Unlock, { toBeClose: true })
                return false
            }
            if (isReset) {
                await resetWallets(password, isReset)
            } else if (password && !hasPassword) {
                await WalletServiceRef.value.changePassword(getDefaultWalletPassword(), password)
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
