import { WebExtensionMessage } from '@dimensiondev/holoflows-kit'
import type { PluginMessageEmitterItem } from '@masknet/plugin-infra'
import type { Serialization } from 'async-call-rpc/base'

/**
 * Create a plugin message emitter
 * @param pluginID The plugin ID
 *
 * @example
 * export const MyPluginMessage = createPluginMessage(PLUGIN_ID)
 */
export let createPluginMessage = <T = DefaultPluginMessage>(
    pluginID: string,
    serializer?: Serialization,
): PluginMessageEmitter<T> => {
    const domain = '@plugin/' + pluginID
    if (cache.has(domain)) return cache.get(domain) as any

    const messageCenter = new WebExtensionMessage<T>({ domain })
    const events = messageCenter.events
    if (serializer) messageCenter.serialization = serializer
    cache.set(domain, events)
    return events
}

export function __workaround__replaceImplementationOfCreatePluginMessage__(
    newImpl: (pluginID: string, serializer?: Serialization | undefined) => PluginMessageEmitter<unknown>,
) {
    createPluginMessage = newImpl as any
}

export interface DefaultPluginMessage {
    /** This one is for plugin RPC */
    rpc: unknown
}
export type PluginMessageEmitter<T> = { readonly [key in keyof T]: PluginMessageEmitterItem<T[key]> }
const cache = new Map<string, PluginMessageEmitter<unknown>>()

// TODO: this type should be defined here, not shared-base
export type { PluginMessageEmitterItem } from '@masknet/shared-base'
