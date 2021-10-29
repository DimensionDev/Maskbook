// All plugin manager need to call createPluginHost so let's register plugins implicitly.
import './register'

import type { Plugin } from '@masknet/plugin-infra'
import { Emitter } from '@servie/events'
import { currentPluginEnabledStatus } from '../settings/settings'
import { isEnvironment, Environment } from '@dimensiondev/holoflows-kit'
// Do not export from '../utils/' to prevent initialization failure
import { MaskMessages } from '../utils/messages'
import i18nNextInstance from '../utils/i18n-next'
import { createI18NBundle } from '@masknet/shared'

export function createPluginHost<Context>(
    signal: AbortSignal | undefined,
    createContext: (plugin: string, signal: AbortSignal) => Context,
): Plugin.__Host.Host<Context> {
    const listening = new Set<string>()
    const enabled: Plugin.__Host.EnabledStatusReporter = {
        isEnabled: (id) => {
            const status = currentPluginEnabledStatus['plugin:' + id]
            if (!listening.has(id)) {
                listening.add(id)
                const undo = status.addListener((newVal) => enabled.events.emit(newVal ? 'enabled' : 'disabled', id))
                signal?.addEventListener('abort', undo)

                // TODO: move it elsewhere.
                if (isEnvironment(Environment.ManifestBackground)) {
                    status.addListener((newVal) => {
                        if (newVal) MaskMessages.events.pluginEnabled.sendToAll(id)
                        else MaskMessages.events.pluginDisabled.sendToAll(id)
                    })
                }
            }
            return status.value
        },
        events: new Emitter(),
    }
    return {
        signal,
        enabled,
        addI18NResource(plugin, resource) {
            createI18NBundle(plugin, resource)(i18nNextInstance)
        },
        createContext,
    }
}
