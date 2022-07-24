import { WalletConnectQRCodeDialogEvent, WalletMessages } from '@masknet/plugin-wallet'
import { createSubscriptionFromAsync, EMPTY_LIST } from '@masknet/shared-base'
import Services from '../extension/service'
import { WalletRPC } from '../plugins/Wallet/messages'
import { MaskMessages } from './messages'

export const RestPartOfPluginUIContextShared = {
    currentPersona: createSubscriptionFromAsync(
        Services.Settings.getCurrentPersonaIdentifier,
        undefined,
        MaskMessages.events.currentPersonaIdentifier.on,
    ),
    send: WalletRPC.sendPayload,
    fetch: r2d2Fetch,
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

    personaSignMessage: Services.Identity.signWithPersona,

    updateAccount: WalletRPC.updateMaskAccount,
    resetAccount: WalletRPC.resetMaskAccount,
    selectAccount: WalletRPC.selectMaskAccount,

    signTransaction: WalletRPC.signTransaction,
    signTypedData: WalletRPC.signTypedData,
    signPersonalMessage: WalletRPC.signPersonalMessage,

    getWallets: WalletRPC.getWallets,
    getWalletPrimary: WalletRPC.getWalletPrimary,
    addWallet: WalletRPC.updateWallet,
    updateWallet: WalletRPC.updateWallet,
    removeWallet: WalletRPC.removeWallet,
}
