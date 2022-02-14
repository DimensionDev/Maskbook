import { Plugin, PluginId } from '@masknet/plugin-infra'
import { Flags } from '@masknet/shared'

export const base: Plugin.Shared.Definition = {
    ID: PluginId.External,
    icon: '\u{1F9E9}',
    name: { fallback: 'Mask External Plugin Loader' },
    description: { fallback: 'Able to load external plugins.' },
    publisher: { name: { fallback: 'Mask Network' }, link: 'https://mask.io/' },
    enableRequirement: {
        architecture: { app: true, web: true },
        networks: { type: 'opt-out', networks: {} },
        target: Flags.mask_SDK_ready ? 'stable' : 'insider',
    },
    experimentalMark: true,
}
