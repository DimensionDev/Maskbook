import './plugins'

import { Emitter } from '@servie/events'
import { startPluginDashboard, Plugin } from '@masknet/plugin-infra/dashboard'
import { Services, Messages } from '../API'
import { createI18NBundle, createSubscriptionFromAsync, i18NextInstance } from '@masknet/shared-base'
import { InMemoryStorages, PersistentStorages } from '../utils/kv-storage'

const PluginHost: Plugin.__Host.Host<Plugin.Dashboard.DashboardContext> = {
    minimalMode: {
        events: new Emitter(),
        isEnabled: (id) => {
            return Services.Settings.getPluginMinimalModeEnabled(id)
        },
    },
    addI18NResource(plugin, resource) {
        createI18NBundle(plugin, resource)(i18NextInstance)
    },
    createContext: (pluginID, signal) => {
        const currentPersonaSub = createSubscriptionFromAsync(
            Services.Settings.getCurrentPersonaIdentifier,
            undefined,
            Messages.events.currentPersonaIdentifier.on,
            signal,
        )
        return {
            createKVStorage(type, defaultValues) {
                if (type === 'memory') return InMemoryStorages.Plugin.createSubScope(pluginID, defaultValues, signal)
                else return PersistentStorages.Plugin.createSubScope(pluginID, defaultValues, signal)
            },
            personaSign: Services.Identity.signWithPersona,
            walletSign: Services.Ethereum.personalSign,
            currentPersona: currentPersonaSub,
            silentSign: Services.Identity.generateSignResult,
        }
    },
}
setTimeout(() => {
    Messages.events.pluginMinimalModeChanged.on(([id, status]) => {
        PluginHost.minimalMode.events.emit(status ? 'enabled' : 'disabled', id)
    })
    startPluginDashboard(PluginHost)
})
