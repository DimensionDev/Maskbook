import { WebExtensionMessage } from '@dimensiondev/holoflows-kit'
import type { Serialization } from 'async-call-rpc/base'

/**
 * Create a plugin message emitter
 * @param pluginID The plugin ID
 *
 * @example
 * export const MyPluginMessage = createPluginMessage(PLUGIN_ID)
 */
export function createPluginMessage<T = DefaultPluginMessage>(
    pluginID: string,
    serializer?: Serialization,
): PluginMessageEmitter<T> {
    const domain = '@plugin/' + pluginID
    if (cache.has(domain)) return cache.get(domain) as any

    const messageCenter = new WebExtensionMessage<T>({ domain })
    const events = messageCenter.events
    if (serializer) messageCenter.serialization = serializer
    cache.set(domain, events)
    return events
}
export interface DefaultPluginMessage {
    /** This one is for plugin RPC */
    rpc: unknown
}
export type PluginMessageEmitter<T> = WebExtensionMessage<T>['events']
const cache = new Map<string, PluginMessageEmitter<unknown>>()
