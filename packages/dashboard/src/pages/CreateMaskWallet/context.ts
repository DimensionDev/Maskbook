import { useWallets } from '@masknet/web3-hooks-base'
import { useCallback } from 'react'
import { useLocation } from 'react-router-dom'
import { createContainer } from 'unstated-next'
import { PluginServices } from '../../API.js'
import { Web3 } from '@masknet/web3-providers'
import { ProviderType } from '@masknet/web3-shared-evm'
import { CrossIsolationMessages } from '@masknet/shared-base'
import { getDefaultUserPassword } from './helpers.js'

function useContext() {
    const location = useLocation()
    const wallets = useWallets()

    const resetWallets = useCallback(
        async (password: string | undefined, isReset: boolean | undefined) => {
            if (!(isReset && wallets.length && password)) return
            await PluginServices.Wallet.resetPassword(password)
            await Web3.resetAllWallets?.({
                providerType: ProviderType.MaskWallet,
            })
            CrossIsolationMessages.events.walletsUpdated.sendToAll(undefined)
        },
        [wallets.length],
    )

    const handlePasswordAndWallets = useCallback(
        async (password: string | undefined, isReset: boolean | undefined) => {
            const hasPassword = await PluginServices.Wallet.hasPassword()
            if (!hasPassword) await PluginServices.Wallet.setDefaultPassword()

            if (isReset) {
                await resetWallets(password, isReset)
            } else if (password && !hasPassword) {
                await PluginServices.Wallet.changePassword(getDefaultUserPassword(), password)
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
