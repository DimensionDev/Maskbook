import './plugins'

import { Emitter } from '@servie/events'
import { startPluginDashboard, Plugin } from '@masknet/plugin-infra/dashboard'
import { createI18NBundle, i18NextInstance } from '@masknet/shared-base'
import { Services, Messages } from '../API'
import { createPartialSharedUIContext } from '../../../mask/shared/plugin-infra/host'
import { RestPartOfPluginUIContextShared } from '../../../mask/src/utils/plugin-context-shared-ui'

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
    createContext: (id, signal) => ({
        ...createPartialSharedUIContext(id, signal),
        ...RestPartOfPluginUIContextShared,
    }),
}
setTimeout(() => {
    Messages.events.pluginMinimalModeChanged.on(([id, status]) => {
        PluginHost.minimalMode.events.emit(status ? 'enabled' : 'disabled', id)
    })
    startPluginDashboard(PluginHost)
})
