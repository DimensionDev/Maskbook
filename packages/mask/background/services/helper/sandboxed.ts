import { fetchText } from './index.js'

export async function fetchSandboxedPluginManifest(addr: string): Promise<unknown> {
    const text = await fetchText(addr + 'mask-manifest.json')

    // TODO: verify manifest
    return JSON.parse(
        text
            .split('\n')
            .filter((x) => !x.match(/^ +\/\//))
            .join('\n'),
    )
}

export async function getReactQueryCache() {
    return browser.storage.local.get('react-query').then(({ 'react-query': data }) => data)
}
