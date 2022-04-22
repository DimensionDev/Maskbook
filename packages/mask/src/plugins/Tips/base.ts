import { Plugin, PluginId } from '@masknet/plugin-infra'

export const base: Plugin.Shared.Definition = {
    ID: PluginId.Tip,
    name: { fallback: 'Tips' },
    description: {
        fallback: 'Tips Entrance',
    },
    publisher: { name: { fallback: 'Mask Network' }, link: 'https://mask.io/' },
    enableRequirement: {
        architecture: { app: true, web: true },
        networks: {
            type: 'opt-out',
            networks: {},
        },
        target: 'stable',
        web3: {},
    },
}
