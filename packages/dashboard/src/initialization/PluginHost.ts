import './plugins'

import { Emitter } from '@servie/events'
import { startPluginDashboard, Plugin } from '@masknet/plugin-infra/dashboard'
import { createI18NBundle, i18NextInstance } from '@masknet/shared-base'
import { Services, Messages } from '../API'
import { createSharedContext } from '../../../mask/src/plugin-infra/host'

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
    createContext: createSharedContext,
}
setTimeout(() => {
    Messages.events.pluginMinimalModeChanged.on(([id, status]) => {
        PluginHost.minimalMode.events.emit(status ? 'enabled' : 'disabled', id)
    })
    startPluginDashboard(PluginHost)
})
