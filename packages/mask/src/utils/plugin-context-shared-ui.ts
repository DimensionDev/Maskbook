import { defer, delay } from '@masknet/kit'
import type { Plugin } from '@masknet/plugin-infra'
import {
    createSubscriptionFromAsync,
    CrossIsolationMessages,
    EMPTY_LIST,
    MaskMessages,
    type SignType,
    Sniffings,
    type ECKeyIdentifier,
} from '@masknet/shared-base'
import { WalletConnectQRCodeModal } from '@masknet/shared'
import Services from '#services'
import type { PartialSharedUIContext } from '../../shared/plugin-infra/host.js'

export const RestPartOfPluginUIContextShared: Omit<
    Plugin.SiteAdaptor.SiteAdaptorContext,
    | keyof PartialSharedUIContext
    | 'lastRecognizedProfile'
    | 'currentVisitingProfile'
    | 'themeSettings'
    | 'getThemeSettings'
    | 'getNextIDPlatform'
    | 'getSocialIdentity'
    | 'getPersonaAvatar'
    | 'setMinimalMode'
    | 'queryPersonaByProfile'
    | 'connectPersona'
    | 'createPersona'
    | 'currentPersonaIdentifier'
    | 'allPersonas'
    | 'getSearchedKeyword'
> = {
    currentPersona: createSubscriptionFromAsync(
        Services.Settings.getCurrentPersonaIdentifier,
        undefined,
        MaskMessages.events.currentPersonaIdentifier.on,
    ),
    send: Services.Wallet.send,

    openDashboard: async (...args) => {
        await Services.Helper.openDashboard(...args)
    },
    openPopupWindow: Services.Helper.openPopupWindow,
    closePopupWindow: Services.Helper.removePopupWindow,
    fetchJSON: Services.Helper.fetchJSON,

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
    closeWalletConnectDialog: () => {
        if (Sniffings.is_popup_page) {
            CrossIsolationMessages.events.popupWalletConnectEvent.sendToAll({ open: false })
            return
        }
        WalletConnectQRCodeModal.close()
    },

    selectMaskWalletAccount: Services.Wallet.selectMaskAccount,

    grantEIP2255Permission: Services.Wallet.grantEIP2255Permission,
    disconnectAllWalletsFromOrigin: Services.Wallet.disconnectAllWalletsFromOrigin,

    signWithPersona: <T>(type: SignType, message: T, identifier?: ECKeyIdentifier, silent?: boolean) =>
        Services.Identity.signWithPersona(type, message, identifier, location.origin, silent),
    signWithWallet: Services.Wallet.signWithWallet,

    wallets: createSubscriptionFromAsync(
        () => Services.Wallet.getWallets(),
        EMPTY_LIST,
        CrossIsolationMessages.events.walletsUpdated.on,
    ),

    getWallets: Services.Wallet.getWallets,
    addWallet: Services.Wallet.addWallet,
    updateWallet: Services.Wallet.updateWallet,
    removeWallet: Services.Wallet.removeWallet,
    resetAllWallets: Services.Wallet.resetAllWallets,

    hasPaymentPassword: Services.Wallet.hasPassword,
}
