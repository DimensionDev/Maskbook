import { WebExtensionMessage } from '@dimensiondev/holoflows-kit'

/**
 * Create a plugin message emitter
 * @param pluginID The plugin ID
 *
 * @example
 * export const MyPluginMessage = createPluginMessage(PLUGIN_ID)
 */
export function createPluginMessage<T = DefaultPluginMessage>(pluginID: string): PluginMessageEmitter<T> {
    const domain = '@plugin/' + pluginID
    if (cache.has(domain)) return cache.get(domain) as any

    const m = new WebExtensionMessage<T>({ domain }).events
    cache.set(domain, m)
    return m
}
export interface DefaultPluginMessage {
    /** This one is for plugin RPC */
    rpc: unknown
}
export type PluginMessageEmitter<T> = WebExtensionMessage<T>['events']
const cache = new Map<string, PluginMessageEmitter<unknown>>()
