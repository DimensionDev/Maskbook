// All plugin manager need to call createPluginHost so let's register plugins implicitly.
import './register'

import type { Plugin } from '@masknet/plugin-infra'
import { Emitter } from '@servie/events'
// Do not export from '../utils/' to prevent initialization failure
import { MaskMessages } from '../utils/messages'
import i18nNextInstance from '../../shared-ui/locales_legacy'
import { createI18NBundle } from '@masknet/shared'
import Services from '../extension/service'

export function createPluginHost<Context>(
    signal: AbortSignal | undefined,
    createContext: (plugin: string, signal: AbortSignal) => Context,
): Plugin.__Host.Host<Context> {
    const enabled: Plugin.__Host.EnabledStatusReporter = {
        isEnabled: Services.Settings.getPluginEnabled,
        events: new Emitter(),
    }
    const a = MaskMessages.events.pluginDisabled.on((x) => enabled.events.emit('disabled', x))
    const b = MaskMessages.events.pluginEnabled.on((x) => enabled.events.emit('enabled', x))
    signal?.addEventListener('abort', () => [a(), b()])

    return {
        signal,
        enabled,
        addI18NResource(plugin, resource) {
            createI18NBundle(plugin, resource)(i18nNextInstance)
        },
        createContext,
    }
}
