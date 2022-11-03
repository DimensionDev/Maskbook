// All plugin manager need to call createPluginHost so let's register plugins implicitly.
import './register'
import type { BooleanPreference, Plugin } from '@masknet/plugin-infra'
import { Emitter } from '@servie/events'
import { MaskMessages } from '../../shared/messages.js'
import { createI18NBundle, createSubscriptionFromValueRef, i18NextInstance } from '@masknet/shared-base'
import { InMemoryStorages, PersistentStorages } from '../../shared/index.js'
import { nativeAPI, hasNativeAPI } from '../../shared/native-rpc/index.js'
import {
    currentMaskWalletAccountSettings,
    currentMaskWalletChainIdSettings,
} from '../legacy-settings/wallet-settings.js'

export type PartialSharedUIContext = Pick<
    Plugin.Shared.SharedUIContext,
    'nativeType' | 'hasNativeAPI' | 'account' | 'chainId' | 'createKVStorage'
>
let sharedUIContextSingleton: Omit<PartialSharedUIContext, 'createKVStorage'>
export const createPartialSharedUIContext = (id: string, signal: AbortSignal): PartialSharedUIContext => {
    sharedUIContextSingleton ??= {
        nativeType: nativeAPI?.type,
        hasNativeAPI,

        account: createSubscriptionFromValueRef(currentMaskWalletAccountSettings),
        chainId: createSubscriptionFromValueRef(currentMaskWalletChainIdSettings),
    }
    return { ...createSharedContext(id, signal), ...sharedUIContextSingleton }
}

export function createSharedContext(pluginID: string, signal: AbortSignal): Plugin.Shared.SharedContext {
    return {
        createKVStorage<T extends object>(type: 'memory' | 'persistent', defaultValues: T) {
            if (type === 'memory') return InMemoryStorages.Plugin.createSubScope(pluginID, defaultValues, signal)
            else return PersistentStorages.Plugin.createSubScope(pluginID, defaultValues, signal)
        },
    }
}

export function createPluginHost<Context>(
    signal: AbortSignal | undefined,
    createContext: (plugin: string, signal: AbortSignal) => Context,
    getPluginMinimalModeEnabled: (id: string) => Promise<BooleanPreference>,
    hasPermission: (host_permission: string[]) => Promise<boolean>,
): Plugin.__Host.Host<Context> {
    const minimalMode: Plugin.__Host.EnabledStatusReporter = {
        isEnabled: getPluginMinimalModeEnabled,
        events: new Emitter(),
    }
    const permission: Plugin.__Host.PermissionReporter = {
        hasPermission,
        events: new Emitter(),
    }
    MaskMessages.events.pluginMinimalModeChanged.on(
        ([id, val]) => minimalMode.events.emit(val ? 'enabled' : 'disabled', id),
        { signal },
    )
    MaskMessages.events.hostPermissionChanged.on(() => permission.events.emit('changed'), { signal })

    return {
        signal,
        minimalMode,
        addI18NResource(plugin, resource) {
            createI18NBundle(plugin, resource)(i18NextInstance)
        },
        createContext,
        permission,
    }
}
