// All plugin manager need to call createPluginHost so let's register plugins implicitly.
import './register'

import type { Plugin } from '@masknet/plugin-infra'
import { Emitter } from '@servie/events'
// Do not export from '../utils/' to prevent initialization failure
import { MaskMessages } from '../utils/messages'
import i18nNextInstance from '../../shared-ui/locales_legacy'
import Services from '../extension/service'
import { createI18NBundle } from '@masknet/shared-base'

export function createPluginHost<Context>(
    signal: AbortSignal | undefined,
    createContext: (plugin: string, signal: AbortSignal) => Context,
): Plugin.__Host.Host<Context> {
    const minimalMode: Plugin.__Host.EnabledStatusReporter = {
        isEnabled: Services.Settings.getPluginMinimalModeEnabled,
        events: new Emitter(),
    }
    const removeListener = MaskMessages.events.pluginMinimalModeChanged.on(([id, val]) =>
        minimalMode.events.emit(val ? 'enabled' : 'disabled', id),
    )
    signal?.addEventListener('abort', removeListener)

    return {
        signal,
        minimalMode,
        addI18NResource(plugin, resource) {
            createI18NBundle(plugin, resource)(i18nNextInstance)
        },
        createContext,
    }
}
