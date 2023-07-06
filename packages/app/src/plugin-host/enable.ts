import './register.js'

import { Emitter } from '@servie/events'
import { CurrentSNSNetwork, startPluginSNSAdaptor } from '@masknet/plugin-infra/content-script'
import { BooleanPreference, createI18NBundle, i18NextInstance } from '@masknet/shared-base'
import { setupReactShadowRootEnvironment } from '@masknet/theme'
import { inMemoryStorage, indexedDBStorage } from './storage.js'
import { createSharedContext } from '../helpers/createSharedContext.js'

startPluginSNSAdaptor(CurrentSNSNetwork.__SPA__, {
    minimalMode: {
        events: new Emitter(),
        isEnabled: () => BooleanPreference.True,
    },
    addI18NResource(plugin, resource) {
        createI18NBundle(plugin, resource)(i18NextInstance)
    },
    createContext(id, signal) {
        return {
            createKVStorage(type, defaultValues) {
                if (type === 'memory') return inMemoryStorage(id, defaultValues, signal)
                else return indexedDBStorage(id, defaultValues, signal)
            },
            ...createSharedContext(),
        }
    },
    permission: {
        hasPermission: async () => false,
        events: new Emitter(),
    },
})

setupReactShadowRootEnvironment({ mode: 'open' }, [])
