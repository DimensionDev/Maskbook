import Services from '#services'
import { initWallet } from '@masknet/web3-providers'
import { allPersonas } from '../initUIContext.js'
import { CrossIsolationMessages, EMPTY_LIST, Sniffings, createSubscriptionFromAsync } from '@masknet/shared-base'
import * as shared from /* webpackDefer: true */ '@masknet/shared'
import { delay } from '@masknet/kit'
import { openPopupWindow } from '../utils/openPopup.js'

await initWallet({
    signWithPersona: (a, b, c, d) => Services.Identity.signWithPersona(a, b, c, location.origin, d),
    WalletConnectContext: {
        openWalletConnectDialog: async (uri: string) => {
            if (Sniffings.is_popup_page) {
                const { promise, resolve, reject } = Promise.withResolvers<boolean>()
                const callback = ({ open }: { open: boolean }) => (!open ? resolve(true) : undefined)

                delay(5000).then(() => reject(new Error('timeout')))
                CrossIsolationMessages.events.popupWalletConnectEvent.on(callback)
                CrossIsolationMessages.events.popupWalletConnectEvent.sendToAll({ uri, open: true })

                await promise.finally(() => CrossIsolationMessages.events.popupWalletConnectEvent.off(callback))
            } else {
                await shared.WalletConnectQRCodeModal.openAndWaitForClose({
                    uri,
                })
            }
        },
        closeWalletConnectDialog: () => {
            if (Sniffings.is_popup_page) {
                CrossIsolationMessages.events.popupWalletConnectEvent.sendToAll({ open: false })
                return
            }
            shared.WalletConnectQRCodeModal.close()
        },
    },
    MessageContext: {
        openPopupWindow,
        send: Services.Wallet.send,
        hasPaymentPassword: Services.Wallet.hasPassword,
    },
    MaskWalletContext: {
        wallets: createSubscriptionFromAsync(
            () => Services.Wallet.getWallets(),
            EMPTY_LIST,
            CrossIsolationMessages.events.walletsUpdated.on,
        ),
        allPersonas,
        resetAllWallets: Services.Wallet.resetAllWallets,
        removeWallet: Services.Wallet.removeWallet,
        renameWallet: Services.Wallet.renameWallet,
        addWallet: Services.Wallet.addWallet,
        selectMaskWalletAccount: Services.Wallet.selectMaskAccount,
        disconnectAllWalletsFromOrigin: Services.Wallet.disconnectAllWalletsFromOrigin,
    },
})
