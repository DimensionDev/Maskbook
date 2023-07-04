import type { Plugin } from '@masknet/plugin-infra'
import { createSubscriptionFromAsync, CrossIsolationMessages, EMPTY_LIST, MaskMessages } from '@masknet/shared-base'
import { WalletConnectQRCodeModal } from '@masknet/shared'
import Services from '../extension/service.js'
import type { PartialSharedUIContext } from '../../shared/plugin-infra/host.js'
import { WalletRPC } from '../plugins/WalletService/messages.js'

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
    | 'setMinimalMode'
    | 'queryPersonaByProfile'
    | 'connectPersona'
    | 'createPersona'
    | 'currentPersonaIdentifier'
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
    fetchJSON: Services.Helper.fetchJSON,

    openWalletConnectDialog: async (uri: string) => {
        await WalletConnectQRCodeModal.openAndWaitForClose({
            uri,
        })
    },
    closeWalletConnectDialog: () => {
        WalletConnectQRCodeModal.close()
    },

    wallets: createSubscriptionFromAsync(
        () => WalletRPC.getWallets(),
        EMPTY_LIST,
        CrossIsolationMessages.events.walletsUpdated.on,
    ),

    selectAccount: WalletRPC.selectMaskAccount,
    recordConnectedSites: WalletRPC.recordConnectedSites,

    signWithPersona: Services.Identity.signWithPersona,
    signWithWallet: WalletRPC.signWithWallet,

    getWallets: WalletRPC.getWallets,
    addWallet: WalletRPC.updateWallet,
    updateWallet: WalletRPC.updateWallet,
    removeWallet: WalletRPC.removeWallet,
    hasPaymentPassword: WalletRPC.hasPassword,
}
