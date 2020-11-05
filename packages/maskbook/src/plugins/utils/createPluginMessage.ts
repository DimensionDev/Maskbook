import { WebExtensionMessage } from '@dimensiondev/holoflows-kit'

export function createPluginMessage<T>(pluginID: string): WebExtensionMessage<T> {
    return new WebExtensionMessage<T>({ domain: '@plugin/' + pluginID })
}
