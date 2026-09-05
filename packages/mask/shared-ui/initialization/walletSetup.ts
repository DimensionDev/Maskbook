import Services from '#services'
import { initWallet } from '@masknet/web3-providers'
import { CrossIsolationMessages, Sniffings } from '@masknet/shared-base'
import defer * as shared from '@masknet/shared'
import { delay } from '@masknet/kit'
import { openPopupWindow } from '../utils/openPopup.js'

await initWallet({
    WalletConnectContext: {
        openWalletConnectDialog: async (uri: string) => {
            if (Sniffings.is_popup_page) {
                const { promise, resolve, reject } = Promise.withResolvers<boolean>()
                const callback = ({ open }: { open: boolean }) => (open ? undefined : resolve(true))

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
    },
})
