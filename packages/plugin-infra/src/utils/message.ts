import { WebExtensionMessage } from '@dimensiondev/holoflows-kit'
import type { PluginMessageEmitterItem } from '@masknet/plugin-infra'
import { serializer } from '@masknet/shared-base'

/** @internal */
export const DOMAIN_RPC = Symbol('create RPC instead of normal message')
/**
 * Create a plugin message emitter
 * @param pluginID The plugin ID
 *
 * @example
 * export const MyPluginMessage = getPluginMessage(PLUGIN_ID)
 */
export function getPluginMessage<T>(pluginID: string, type?: typeof DOMAIN_RPC): PluginMessageEmitter<T> {
    const domain = (type === DOMAIN_RPC ? '@plugin-rpc/' : '@plugin/') + pluginID
    if (cache.has(domain)) return cache.get(domain) as any

    const messageCenter = new WebExtensionMessage<T>({ domain })
    const events = messageCenter.events
    messageCenter.serialization = serializer
    cache.set(domain, events)
    return events
}
export type PluginMessageEmitter<T> = { readonly [key in keyof T]: PluginMessageEmitterItem<T[key]> }
const cache = new Map<string, PluginMessageEmitter<unknown>>()

// TODO: this type should be defined here, not shared-base
export type { PluginMessageEmitterItem } from '@masknet/shared-base'
