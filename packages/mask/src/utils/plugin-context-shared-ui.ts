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
    send: WalletRPC.sendPayload,
    openPopupWindow: Services.Helper.openPopupWindow,
    closePopupWindow: Services.Helper.removePopupWindow,

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
    walletPrimary: createSubscriptionFromAsync(
        () => WalletRPC.getWalletPrimary(),
        null,
        WalletMessages.events.walletsUpdated.on,
    ),

    updateAccount: WalletRPC.updateMaskAccount,
    selectAccount: WalletRPC.selectMaskAccount,
    recordConnectedSites: WalletRPC.recordConnectedSites,

    personaSignMessage: Services.Identity.signWithPersona,
    generateSignResult: Services.Identity.generateSignResult,

    signTransaction: WalletRPC.signTransaction,
    signTypedData: WalletRPC.signTypedData,
    signPersonalMessage: WalletRPC.signPersonalMessage,

    getWallets: WalletRPC.getWallets,
    getWalletPrimary: WalletRPC.getWalletPrimary,
    addWallet: WalletRPC.updateWallet,
    updateWallet: WalletRPC.updateWallet,
    removeWallet: WalletRPC.removeWallet,
}
