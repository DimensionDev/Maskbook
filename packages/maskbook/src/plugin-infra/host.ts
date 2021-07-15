// All plugin manager need to call createPluginHost so let's register plugins implicitly.
import './register'

import type { Plugin } from '@masknet/plugin-infra'
import { Emitter } from '@servie/events'
import i18nNextInstance from '../utils/i18n-next'
import { createI18NBundle } from '@masknet/shared'

export function createPluginHost(signal?: AbortSignal): Plugin.__Host.Host {
    return {
        signal,
        // TODO: need a place to store enabled/disabled status of a plugin id
        enabled: {
            isEnabled: (id) => true,
            events: new Emitter(),
        },
        addI18NResource(plugin, resource) {
            createI18NBundle(plugin, resource)(i18nNextInstance)
        },
    }
}
