// All plugin manager need to call createPluginHost so let's register plugins implicitly.
import './register'

import type { Plugin } from '@masknet/plugin-infra'
import { Emitter } from '@servie/events'
import { currentPluginEnabledStatus } from '../settings/settings'
import { isEnvironment, Environment } from '@dimensiondev/holoflows-kit'
import { MaskMessage } from '../utils'
export function createPluginHost(signal?: AbortSignal): Plugin.__Host.Host {
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
                        if (newVal) MaskMessage.events.pluginEnabled.sendToAll(id)
                        else MaskMessage.events.pluginDisabled.sendToAll(id)
                    })
                }
            }
            return status.value
        },
        events: new Emitter(),
    }
    return { signal, enabled }
}
