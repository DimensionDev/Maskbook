// All plugin manager need to call createPluginHost so let's register plugins implicitly.
import './register.js'
import { Emitter } from '@servie/events'
import type { Plugin } from '@masknet/plugin-infra'
import {
    BooleanPreference,
    MaskMessages,
    createI18NBundle,
    InMemoryStorages,
    PersistentStorages,
} from '@masknet/shared-base'
import { Flags } from '@masknet/flags'
import { i18n } from '@lingui/core'

export function createSharedContext(pluginID: string, signal: AbortSignal): Plugin.Shared.SharedContext {
    return {
        createKVStorage<T extends object>(type: 'memory' | 'persistent', defaultValues: T) {
            if (type === 'memory') return InMemoryStorages.Plugin.createSubScope(pluginID, defaultValues, signal)
            else return PersistentStorages.Plugin.createSubScope(pluginID, defaultValues, signal)
        },
    }
}

export function createPluginHost<Definition, Context>(
    signal: AbortSignal | undefined,
    createContext: (plugin: string, definition: Definition, signal: AbortSignal) => Context,
    getPluginMinimalModeEnabled: (id: string) => Promise<BooleanPreference>,
    hasPermission: (host_permission: string[]) => Promise<boolean>,
): Plugin.__Host.Host<Definition, Context> {
    const minimalMode: Plugin.__Host.EnabledStatusReporter = {
        isEnabled: getPluginMinimalModeEnabled,
        events: new Emitter(),
    }
    const disabled: Plugin.__Host.EnabledStatusReporter = {
        isEnabled: (id) => {
            const result = Flags.globalDisabledPlugins.includes(id)
            if (result) return BooleanPreference.False
            return BooleanPreference.True
        },
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
        disabled,
        minimalMode,
        addI18NResource(plugin, resource) {
            createI18NBundle(resource)(i18n)
        },
        createContext,
        permission,
    }
}
