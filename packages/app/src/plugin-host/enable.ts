import './register.js'

import { Emitter } from '@servie/events'
import { startPluginSiteAdaptor } from '@masknet/plugin-infra/content-script'
import {
    BooleanPreference,
    EMPTY_ARRAY,
    EnhanceableSite,
    UNDEFINED,
    createI18NBundle,
    i18NextInstance,
} from '@masknet/shared-base'
import { setupReactShadowRootEnvironment } from '@masknet/theme'
import { inMemoryStorage, indexedDBStorage } from '../setup/storage.js'
import { createSharedContext } from '../helpers/createSharedContext.js'
import { __setSiteAdaptorContext__ } from '@masknet/plugin-infra/content-script/context'

__setSiteAdaptorContext__({
    lastRecognizedProfile: UNDEFINED,
    currentVisitingProfile: UNDEFINED,
    allPersonas: EMPTY_ARRAY,
    queryPersonaAvatar: async (identifiers): Promise<any> => {
        if (Array.isArray(identifiers)) return new Map()
        return undefined
    },
})

startPluginSiteAdaptor(EnhanceableSite.App, {
    minimalMode: {
        events: new Emitter(),
        isEnabled: () => BooleanPreference.False,
    },
    addI18NResource(plugin, resource) {
        createI18NBundle(plugin, resource)(i18NextInstance)
    },
    createContext(id, def, signal) {
        return {
            createKVStorage(type, defaultValues) {
                if (type === 'memory') return inMemoryStorage(id, defaultValues, signal)
                else return indexedDBStorage(id, defaultValues, signal)
            },
            setWeb3State(state) {
                def.Web3State = state
            },
            setMinimalMode(enabled) {
                console.warn('setMinimalMode is ignored.')
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
