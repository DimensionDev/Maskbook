import { getNetwork } from '../../social-network-adaptor'
import type { Plugin } from '../types'
import { isEnvironment, Environment } from '@dimensiondev/holoflows-kit'
import { Emitter } from '@servie/events'
import { useSubscription, Subscription } from 'use-subscription'
import type { ActivatedPluginInstance } from './shared'

const subscription: Subscription<UI[]> = {
    getCurrentValue: () => [...activatedPluginUI.values()].map((x) => x.instance),
    subscribe: (f) => {
        events.on('onUpdate', f)
        return () => events.off('onUpdate', f)
    },
}
export function useActivatedPluginInstanceUI() {
    return useSubscription(subscription)
}
/** If this check does not passes, the plugin will not registered. */
function meetRegisterRequirement(def: Plugin.Config.Definition) {
    // arch check
    if (process.env.architecture === 'app' && !def.enableRequirement.architecture.app) return false
    if (process.env.architecture === 'web' && !def.enableRequirement.architecture.web) return false

    // build variant check
    if (process.env.NODE_ENV === 'production') {
        if (process.env.build === 'stable' && def.enableRequirement.target !== 'stable') {
            return false
        } else if (process.env.build === 'beta' && def.enableRequirement.target === 'insider') {
            return false
        }
    }
    return true
}
export function registerPluginUI(def: Plugin.DeferredDefinition) {
    if (meetRegisterRequirement(def)) registeredPluginUI.set(def.ID, def)
}
/** Check if the plugin has met it's start requirement. */
export function meetStartRequirement(id: string): boolean {
    const def = registeredPluginUI.get(id)
    if (!def) return false

    // Dashboard plugins are always loaded.
    if (isEnvironment(Environment.ManifestOptions)) return true
    if (!isEnvironment(Environment.ContentScript)) return false
    // content script check

    // SNS adaptor
    const network = getNetwork()
    if (!network) return false
    if (!def.enableRequirement.networks[network]) return false
    return true
}
/** Start a plugin (without check if the start requirement has met). */
export async function startPluginUI(id: string) {
    if (activatedPluginUI.has(id)) return

    const def = registeredPluginUI.get(id)
    if (!def) return

    const runningPlugin: ActivatedPluginInstance<Plugin.UI.Definition> = {
        instance: (await def.load_ui()).default,
        controller: new AbortController(),
    }
    const { controller, instance } = runningPlugin
    await instance.init(controller.signal)
    activatedPluginUI.set(def.ID, runningPlugin)
    events.emit('onUpdate')
}

export async function stopPluginUI(id: string) {
    const activated = activatedPluginUI.get(id)
    if (!activated) return

    activated.controller.abort()
    activatedPluginUI.delete(id)
    events.emit('onUpdate')
}

const events = new Emitter<{
    onUpdate: []
}>()
type UI = Plugin.UI.Definition
const activatedPluginUI = new Map<string, ActivatedPluginInstance<UI>>()
const registeredPluginUI = new Map<string, Plugin.DeferredDefinition>()
