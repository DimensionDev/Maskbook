// All plugin manager need to call createPluginHost so let's register plugins implicitly.
import './register'
import type { Plugin } from '@masknet/plugin-infra'
import { Emitter } from '@servie/events'
import { MaskMessages } from '../../shared/messages'
import Services from '../extension/service'
import {
    createI18NBundle,
    createSubscriptionFromAsync,
    createSubscriptionFromValueRef,
    EMPTY_LIST,
    i18NextInstance,
} from '@masknet/shared-base'
import { InMemoryStorages, PersistentStorages } from '../../shared'
import { nativeAPI, hasNativeAPI } from '../../shared/native-rpc'
import { currentMaskWalletAccountSettings, currentMaskWalletChainIdSettings } from '../plugins/Wallet/settings'
import { WalletMessages, WalletRPC } from '../plugins/Wallet/messages'
import type { WalletConnectQRCodeDialogEvent } from '@masknet/plugin-wallet'

const SharedContext: Omit<Plugin.Shared.SharedContext, 'createKVStorage'> = {
    currentPersona: createSubscriptionFromAsync(
        Services.Settings.getCurrentPersonaIdentifier,
        undefined,
        MaskMessages.events.currentPersonaIdentifier.on,
    ),

    nativeType: nativeAPI?.type,
    hasNativeAPI,

    send: WalletRPC.sendPayload,

    fetch: Services.Helper.r2d2Fetch,

    openPopupWindow: Services.Helper.openPopupWindow,
    closePopupWindow: Services.Helper.removePopupWindow,

    openWalletConnectDialog: (uri: string, callback) => {
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

    account: createSubscriptionFromValueRef(currentMaskWalletAccountSettings),
    chainId: createSubscriptionFromValueRef(currentMaskWalletChainIdSettings),

    wallets: createSubscriptionFromAsync(
        () => {
            console.log('DEBUG: wallet rpc get wallets')
            return WalletRPC.getWallets()
        },
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

export function createSharedContext(pluginID: string, signal: AbortSignal): Plugin.Shared.SharedContext {
    return {
        createKVStorage<T extends object>(type: 'memory' | 'persistent', defaultValues: T) {
            if (type === 'memory') return InMemoryStorages.Plugin.createSubScope(pluginID, defaultValues)
            else return PersistentStorages.Plugin.createSubScope(pluginID, defaultValues)
        },
        ... SharedContext,
    }
}

export function createPluginHost<Context>(
    signal: AbortSignal | undefined,
    createContext: (plugin: string, signal: AbortSignal) => Context,
): Plugin.__Host.Host<Context> {
    const minimalMode: Plugin.__Host.EnabledStatusReporter = {
        isEnabled: Services.Settings.getPluginMinimalModeEnabled,
        events: new Emitter(),
    }
    MaskMessages.events.pluginMinimalModeChanged.on(
        ([id, val]) => minimalMode.events.emit(val ? 'enabled' : 'disabled', id),
        { signal },
    )

    return {
        signal,
        minimalMode,
        addI18NResource(plugin, resource) {
            createI18NBundle(plugin, resource)(i18NextInstance)
        },
        createContext,
    }
}
