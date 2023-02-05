import { Emitter } from '@servie/events'
import { BooleanPreference, CurrentSNSNetwork, startPluginSNSAdaptor } from '@masknet/plugin-infra/content-script'
import { createI18NBundle, i18NextInstance } from '@masknet/shared-base'

startPluginSNSAdaptor(CurrentSNSNetwork.Unknown, {
    minimalMode: {
        events: new Emitter(),
        isEnabled: () => BooleanPreference.True,
    },
    addI18NResource(plugin, resource) {
        createI18NBundle(plugin, resource)(i18NextInstance)
    },
    createContext(id, signal) {
        return null!
    },
    permission: {
        hasPermission: async () => false,
        events: new Emitter(),
    },
})
