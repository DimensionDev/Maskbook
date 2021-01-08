import { WebExtensionMessage } from '@dimensiondev/holoflows-kit'

const cache = new Map<string, WebExtensionMessage<any>>()
export function createPluginMessage<T>(pluginID: string): WebExtensionMessage<T> {
    const domain = '@plugin/' + pluginID
    if (cache.has(domain)) return cache.get(domain)!

    const m = new WebExtensionMessage<T>({ domain })
    cache.set(domain, m)
    return m
}
