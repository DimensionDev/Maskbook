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

export const NextSharedUIContext = {
    allPersonas: createSubscriptionFromAsync(
        () => Services.Identity.queryOwnedPersonaInformation(true),
        [],
        (x) => {
            const clearCurrentPersonaIdentifier = MaskMessages.events.currentPersonaIdentifier.on(x)
            const clearPersonasChanged = MaskMessages.events.personasChanged.on(x)

            return () => {
                clearCurrentPersonaIdentifier()
                clearPersonasChanged()
            }
        },
    ),
    currentPersonaIdentifier: createSubscriptionFromAsync(
        Services.Settings.getCurrentPersonaIdentifier,
        undefined,
        MaskMessages.events.currentPersonaIdentifier.on,
    ),
}
export const RestPartOfPluginUIContextShared: Omit<
    Plugin.SiteAdaptor.SiteAdaptorContext,
    | 'createKVStorage'
    | 'lastRecognizedProfile'
    | 'currentVisitingProfile'
    | 'themeSettings'
    | 'getThemeSettings'
    | 'getPersonaAvatar'
    | 'setMinimalMode'
    | 'queryPersonaByProfile'
    | 'connectPersona'
    | 'createPersona'
    | 'currentPersonaIdentifier'
    | 'getSearchedKeyword'
> = {
    send: Services.Wallet.send,

    openDashboard: Services.Helper.openDashboard,
    openPopupWindow: Services.Helper.openPopupWindow,
    closePopupWindow: Services.Helper.removePopupWindow,

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

    signWithPersona: (type: SignType, message: unknown, identifier?: ECKeyIdentifier, silent?: boolean) =>
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

    hasPaymentPassword: Services.Wallet.hasPassword,
}
