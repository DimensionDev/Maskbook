// All plugin manager need to call createPluginHost so let's register plugins implicitly.
import './register.js'
import { Emitter } from '@servie/events'
import type { Plugin } from '@masknet/plugin-infra'
import { type BooleanPreference, MaskMessages, createI18NBundle, i18NextInstance } from '@masknet/shared-base'
import { InMemoryStorages, PersistentStorages } from '../index.js'

export type PartialSharedUIContext = Pick<Plugin.Shared.SharedUIContext, 'createKVStorage' | 'setWeb3State'>
export function createPartialSharedUIContext<Definition extends Plugin.GeneralUI.Definition>(
    id: string,
    definition: Definition,
    signal: AbortSignal,
): PartialSharedUIContext {
    return {
        ...createSharedContext(id, signal),
        setWeb3State(state) {
            definition.Web3State = state
        },
    }
}

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
