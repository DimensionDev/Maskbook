import type { Plugin } from '@masknet/plugin-infra'
import { createSubscriptionFromAsync, EMPTY_LIST } from '@masknet/shared-base'
import { WalletConnectQRCodeDialogEvent, WalletMessages } from '@masknet/plugin-wallet'
import Services from '../extension/service.js'
import { WalletRPC } from '../plugins/Wallet/messages.js'
import { MaskMessages } from './messages.js'
import type { PartialSharedUIContext } from '../../shared/plugin-infra/host.js'

export const RestPartOfPluginUIContextShared: Omit<
    Plugin.SNSAdaptor.SNSAdaptorContext,
    | keyof PartialSharedUIContext
    | 'lastRecognizedProfile'
    | 'currentVisitingProfile'
    | 'themeSettings'
    | 'getThemeSettings'
    | 'getNextIDPlatform'
    | 'getSocialIdentity'
    | 'getPersonaAvatar'
    | 'ownProofChanged'
    | 'setMinimalMode'
> = {
    currentPersona: createSubscriptionFromAsync(
        Services.Settings.getCurrentPersonaIdentifier,
        undefined,
        MaskMessages.events.currentPersonaIdentifier.on,
    ),
    send: WalletRPC.send,
    confirmRequest: WalletRPC.confirmRequest,
    rejectRequest: WalletRPC.rejectRequest,

    openDashboard: Services.Helper.openDashboard,

    openPopupWindow: Services.Helper.openPopupWindow,
    closePopupWindow: Services.Helper.removePopupWindow,
    openPopupConnectWindow: Services.Helper.openPopupConnectWindow,

    openWalletConnectDialog: (uri: string, callback: () => void) => {
        const onClose = (ev: WalletConnectQRCodeDialogEvent) => {
            if (ev.open) return
            callback()
            WalletMessages.events.walletConnectQRCodeDialogUpdated.off(onClose)
        }
        WalletMessages.events.walletConnectQRCodeDialogUpdated.on(onClose)
        WalletMessages.events.walletConnectQRCodeDialogUpdated.sendToLocal({
            open: true,
            uri,
        })
    },
    closeWalletConnectDialog: () => {
        WalletMessages.events.walletConnectQRCodeDialogUpdated.sendToLocal({
            open: false,
        })
    },

    wallets: createSubscriptionFromAsync(
        () => WalletRPC.getWallets(),
        EMPTY_LIST,
        WalletMessages.events.walletsUpdated.on,
    ),

    selectAccount: WalletRPC.selectMaskAccount,
    recordConnectedSites: WalletRPC.recordConnectedSites,

    signWithPersona: Services.Identity.signWithPersona,
    signWithWallet: WalletRPC.signWithWallet,

    getWallets: WalletRPC.getWallets,
    addWallet: WalletRPC.updateWallet,
    updateWallet: WalletRPC.updateWallet,
    removeWallet: WalletRPC.removeWallet,
}
