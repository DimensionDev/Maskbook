import './plugins'

import { Emitter } from '@servie/events'
import { startPluginDashboard, Plugin } from '@masknet/plugin-infra'
import { Services, Messages } from '../API'
import { createI18NBundle } from '@masknet/shared'
import i18n from 'i18next'

const PluginHost: Plugin.__Host.Host = {
    enabled: {
        events: new Emitter(),
        isEnabled: (id) => {
            return Services.Settings.getPluginEnabled(id)
        },
    },
    addI18NResource(plugin, resource) {
        createI18NBundle(plugin, resource)(i18n)
    },
    createContext: () => undefined,
}
setTimeout(() => {
    Messages.events.pluginEnabled.on((id) => PluginHost.enabled.events.emit('enabled', id))
    Messages.events.pluginDisabled.on((id) => PluginHost.enabled.events.emit('disabled', id))
    startPluginDashboard(PluginHost)
})
