// All plugin manager need to call createPluginHost so let's register plugins implicitly.
import './register'

import type { Plugin } from '@masknet/plugin-infra'
import { Emitter } from '@servie/events'
import { currentPluginEnabledStatus } from '../settings/settings'

export function createPluginHost(signal?: AbortSignal): Plugin.__Host.Host {
    const listening = new Set<string>()
    const enabled: Plugin.__Host.EnabledStatusReporter = {
        isEnabled: (id) => {
            const status = currentPluginEnabledStatus['plugin:' + id]
            if (!listening.has(id)) {
                listening.add(id)
                const undo = status.addListener((newVal) => enabled.events.emit(newVal ? 'enabled' : 'disabled', id))
                signal?.addEventListener('abort', undo)
            }
            return status.value
        },
        events: new Emitter(),
    }
    return { signal, enabled }
}
