import Services from '#services'
import { initWallet } from '@masknet/web3-providers'
import { allPersonas } from '../../shared-ui/initUIContext.js'
import { CrossIsolationMessages, EMPTY_LIST, Sniffings, createSubscriptionFromAsync } from '@masknet/shared-base'
import { WalletConnectQRCodeModal } from '@masknet/shared'
import { defer, delay } from '@masknet/kit'

initWallet({
    addWallet: Services.Wallet.addWallet,
    signWithPersona: (a, b, c, d) => Services.Identity.signWithPersona(a, b, c, location.origin, d),
    closeWalletConnectDialog: () => {
        if (Sniffings.is_popup_page) {
            CrossIsolationMessages.events.popupWalletConnectEvent.sendToAll({ open: false })
            return
        }
        WalletConnectQRCodeModal.close()
    },
    openPopupWindow: Services.Helper.openPopupWindow,
    openWalletConnectDialog: async (uri: string) => {
        if (Sniffings.is_popup_page) {
            const [promise, resolve, reject] = defer<boolean>()
            const callback = ({ open }: { open: boolean }) => (!open ? resolve(true) : undefined)

            delay(5000).then(() => reject(new Error('timeout')))
            CrossIsolationMessages.events.popupWalletConnectEvent.on(callback)
            CrossIsolationMessages.events.popupWalletConnectEvent.sendToAll({ uri, open: true })

            await promise.finally(() => CrossIsolationMessages.events.popupWalletConnectEvent.off(callback))
        } else {
            await WalletConnectQRCodeModal.openAndWaitForClose({
                uri,
            })
        }
    },

    send: Services.Wallet.send,
    selectMaskWalletAccount: Services.Wallet.selectMaskAccount,

    grantEIP2255Permission: Services.Wallet.grantEIP2255Permission,
    disconnectAllWalletsFromOrigin: Services.Wallet.disconnectAllWalletsFromOrigin,
    wallets: createSubscriptionFromAsync(
        () => Services.Wallet.getWallets(),
        EMPTY_LIST,
        CrossIsolationMessages.events.walletsUpdated.on,
    ),
    hasPaymentPassword: Services.Wallet.hasPassword,
    MaskWalletContext: {
        allPersonas,
        resetAllWallets: Services.Wallet.resetAllWallets,
        removeWallet: Services.Wallet.removeWallet,
        renameWallet: Services.Wallet.renameWallet,
    },
})
