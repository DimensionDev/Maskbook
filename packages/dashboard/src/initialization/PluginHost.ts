import './plugins'

import { Emitter } from '@servie/events'
import { startPluginDashboard, Plugin } from '@masknet/plugin-infra'
import { Services, Messages } from '../API'
import { createI18NBundle } from '@masknet/shared-base'
import i18n from 'i18next'
import { InMemoryStorages, PersistentStorages } from '../utils/kv-storage'

const PluginHost: Plugin.__Host.Host<Plugin.Dashboard.DashboardContext> = {
    minimalMode: {
        events: new Emitter(),
        isEnabled: (id) => {
            return Services.Settings.getPluginMinimalModeEnabled(id)
        },
    },
    addI18NResource(plugin, resource) {
        createI18NBundle(plugin, resource)(i18n)
    },
    createContext: (pluginID, signal) => {
        return {
            createKVStorage(type, defaultValues) {
                if (type === 'memory') return InMemoryStorages.Plugin.createSubScope(pluginID, defaultValues, signal)
                else return PersistentStorages.Plugin.createSubScope(pluginID, defaultValues, signal)
            },
            personaSign: Services.Identity.signWithPersona,
            walletSign: Services.Ethereum.personalSign,
            nextID: {
                query: Services.NextID.queryExistedBinding,
            },
        }
    },
}
setTimeout(() => {
    Messages.events.pluginMinimalModeChanged.on(([id, status]) => {
        PluginHost.minimalMode.events.emit(status ? 'enabled' : 'disabled', id)
    })
    startPluginDashboard(PluginHost)
})
