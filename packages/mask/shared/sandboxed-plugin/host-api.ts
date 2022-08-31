import { Environment, MessageTarget, WebExtensionMessage } from '@dimensiondev/holoflows-kit'

export function createHostAPIs(isBackground: boolean) {
    return {
        async getPluginList() {
            const plugins = await fetch(browser.runtime.getURL('/sandboxed-modules/plugins.json')).then((x) => x.json())
            // TODO: validate type of plugins here
            return Object.entries(plugins) as Array<[string, any]>
        },
        async fetchManifest(id: string, isLocal: boolean) {
            const prefix: string = isLocal ? 'local-plugin' : 'plugin'
            const manifestPath = `/sandboxed-modules/${prefix}-${id}/mask-manifest.json`
            const manifestURL = new URL(manifestPath, location.href)
            if (manifestURL.pathname !== manifestPath) throw new TypeError('Plugin ID is invalid.')
            return fetch(browser.runtime.getURL(manifestPath)).then((x) => x.json())
        },
        // TODO: support signal
        createRpcChannel(id: string) {
            return new WebExtensionMessage<{ f: any }>({ domain: `mask-plugin-${id}-rpc` }).events.f.bind(
                isBackground ? MessageTarget.Broadcast : Environment.ManifestBackground,
            )
        },
        // TODO: support signal
        createRpcGeneratorChannel(id: string) {
            return new WebExtensionMessage<{ g: any }>({ domain: `mask-plugin-${id}-rpc` }).events.g.bind(
                isBackground ? MessageTarget.Broadcast : Environment.ManifestBackground,
            )
        },
    }
}
