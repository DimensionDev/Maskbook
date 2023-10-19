import './register.js'

import { Emitter } from '@servie/events'
import {
    startPluginSiteAdaptor,
    __setSiteAdaptorContext__,
    __setUIContext__,
} from '@masknet/plugin-infra/content-script'
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

async function reject(): Promise<never> {
    throw new Error('Not implemented')
}
__setUIContext__({
    currentPersona: UNDEFINED,
    allPersonas: EMPTY_ARRAY,
    queryPersonaByProfile: reject,
    queryPersonaAvatar: async (identifiers): Promise<any> => {
        if (Array.isArray(identifiers)) return new Map()
        return undefined
    },
    querySocialIdentity: reject,
    fetchJSON: reject,
    openDashboard: reject,
    openPopupWindow: reject,
    signWithPersona: reject,
    hasPaymentPassword: reject,
    attachProfile: undefined,
    createPersona: reject,
    hasHostPermission: undefined,
    requestHostPermission: undefined,
    setCurrentPersonaIdentifier: undefined,
    setPluginMinimalModeEnabled: undefined,
})
__setSiteAdaptorContext__({
    lastRecognizedProfile: UNDEFINED,
    currentVisitingProfile: UNDEFINED,
    currentNextIDPlatform: undefined,
    currentPersonaIdentifier: UNDEFINED,
    getPostURL: () => null,
    share: undefined,
    connectPersona: reject,
    getPostIdFromNewPostToast: undefined,
    getSearchedKeyword: undefined,
    getUserIdentity: undefined,
    postMessage: undefined,
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
            setMinimalMode(enabled) {
                console.warn('setMinimalMode is ignored.')
            },
            connectPersona: reject,
            createPersona: reject,
        }
    },
    permission: {
        hasPermission: async () => false,
        events: new Emitter(),
    },
})

setupReactShadowRootEnvironment({ mode: 'open' }, [])
