import './plugins'

import { Emitter } from '@servie/events'
import { startPluginDashboard, Plugin } from '@masknet/plugin-infra'
import { Services, Messages } from '../API'
import { createI18NBundle } from '@masknet/shared'
import i18n from 'i18next'
import { InMemoryStorages, PersistentStorages } from '../utils/kv-storage'

const PluginHost: Plugin.__Host.Host<Plugin.Dashboard.DashboardContext> = {
    enabled: {
        events: new Emitter(),
        isEnabled: (id) => {
            return Services.Settings.getPluginEnabled(id)
        },
    },
    addI18NResource(plugin, resource) {
        createI18NBundle(plugin, resource)(i18n)
    },
    createContext: (pluginID, signal) => {
        return {
            createKVStorage(type, defaultValues) {
                if (type === 'memory') return InMemoryStorages.Plugin.createSubscope(pluginID, defaultValues, signal)
                else return PersistentStorages.Plugin.createSubscope(pluginID, defaultValues, signal)
            },
        }
    },
}
setTimeout(() => {
    Messages.events.pluginEnabled.on((id) => PluginHost.enabled.events.emit('enabled', id))
    Messages.events.pluginDisabled.on((id) => PluginHost.enabled.events.emit('disabled', id))
    startPluginDashboard(PluginHost)
})
