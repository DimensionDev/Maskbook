import { useWallets } from '@masknet/web3-hooks-base'
import { useCallback } from 'react'
import { useLocation } from 'react-router-dom'
import { createContainer } from 'unstated-next'
import { PluginServices } from '../../API.js'
import { Web3 } from '@masknet/web3-providers'
import { ProviderType } from '@masknet/web3-shared-evm'
import { CrossIsolationMessages } from '@masknet/shared-base'

function useContext() {
    const location = useLocation()
    const wallets = useWallets()

    const resetWallets = useCallback(async () => {
        const password = location.state?.password
        const hasPassword = await PluginServices.Wallet.hasPassword()
        console.log({ isReset: location.state?.isReset })
        if (location.state?.isReset && wallets.length) {
            await PluginServices.Wallet.resetPassword(password)
            for (const wallet of wallets) {
                await Web3.removeWallet?.(wallet.address, '', {
                    providerType: ProviderType.MaskWallet,
                })
            }
            CrossIsolationMessages.events.walletsUpdated.sendToAll(undefined)
        } else if (hasPassword === false) {
            await PluginServices.Wallet.setPassword(password)
        }
    }, [wallets, location.state?.password, location.state?.isReset])
    return {
        resetWallets,
    }
}

export const ResetWalletContext = createContainer(useContext)
