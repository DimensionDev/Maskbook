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
