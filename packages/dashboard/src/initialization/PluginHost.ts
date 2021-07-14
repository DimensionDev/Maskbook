import './plugins'

import { Emitter } from '@servie/events'
import { startPluginDashboard, Plugin } from '@masknet/plugin-infra'
import { Services, Messages } from '../API'

const PluginHost: Plugin.__Host.Host = {
    enabled: {
        events: new Emitter(),
        isEnabled: (id) => {
            return Services.Settings.isPluginEnabled(id)
        },
    },
}
setTimeout(() => {
    Messages.events.pluginEnabled.on((id) => PluginHost.enabled.events.emit('enabled', id))
    Messages.events.pluginDisabled.on((id) => PluginHost.enabled.events.emit('disabled', id))
    startPluginDashboard(PluginHost)
})
