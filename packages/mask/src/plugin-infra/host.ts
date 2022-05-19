// All plugin manager need to call createPluginHost so let's register plugins implicitly.
import './register'

import type { JsonRpcPayload, JsonRpcResponse } from 'web3-core-helpers'
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

export function createSharedContext(pluginID: string, signal: AbortSignal): Plugin.Shared.SharedContext {
    return {
        createKVStorage<T extends object>(type: 'memory' | 'persistent', name: string, defaultValues: T) {
            if (type === 'memory')
                return InMemoryStorages.Plugin.createSubScope(`${pluginID}_${name}`, defaultValues, signal)
            else return PersistentStorages.Plugin.createSubScope(`${pluginID}_${name}`, defaultValues, signal)
        },

        nativeType: nativeAPI?.type,
        hasNativeAPI,

        send: async (payload: JsonRpcPayload) => {
            if (nativeAPI?.type === 'iOS') {
                return nativeAPI.api.send(payload) as unknown as JsonRpcResponse
            } else {
                const response = await nativeAPI?.api.sendJsonString(JSON.stringify(payload))
                if (!response) throw new Error('Failed to send request to native APP.')
                return JSON.parse(response) as JsonRpcResponse
            }
        },

        openPopupWindow: Services.Helper.openPopupWindow,
        closePopupWindow: Services.Helper.removePopupWindow,

        account: createSubscriptionFromValueRef(currentMaskWalletAccountSettings),
        chainId: createSubscriptionFromValueRef(currentMaskWalletChainIdSettings),

        currentPersona: createSubscriptionFromAsync(
            Services.Settings.getCurrentPersonaIdentifier,
            undefined,
            MaskMessages.events.currentPersonaIdentifier.on,
            signal,
        ),

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
        selectAccountPrepare: WalletRPC.selectMaskAccountPrepare,

        signTransaction: WalletRPC.signTransaction,
        signTypedData: WalletRPC.signTypedData,
        signPersonalMessage: WalletRPC.signPersonalMessage,

        addWallet: WalletRPC.updateWallet,
        updateWallet: WalletRPC.updateWallet,
        removeWallet: WalletRPC.removeWallet,

        shiftUnconfirmedRequest: WalletRPC.shiftUnconfirmedRequest,
        pushUnconfirmedRequest: WalletRPC.pushUnconfirmedRequest,
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
    const removeListener = MaskMessages.events.pluginMinimalModeChanged.on(([id, val]) =>
        minimalMode.events.emit(val ? 'enabled' : 'disabled', id),
    )
    signal?.addEventListener('abort', removeListener)

    return {
        signal,
        minimalMode,
        addI18NResource(plugin, resource) {
            createI18NBundle(plugin, resource)(i18NextInstance)
        },
        createContext,
    }
}
