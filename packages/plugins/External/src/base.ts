import type { Plugin } from '@masknet/plugin-infra'
import { PluginID } from '@masknet/shared-base'
import { Flags } from '@masknet/flags'

export const base: Plugin.Shared.Definition = {
    ID: PluginID.External,
    name: { fallback: 'Mask External Plugin Loader' },
    description: { fallback: 'Able to load external plugins.' },
    publisher: { name: { fallback: 'Mask Network' }, link: 'https://mask.io/' },
    enableRequirement: {
        networks: { type: 'opt-out', networks: {} },
        target: Flags.mask_SDK_ready ? 'stable' : 'insider',
    },
    experimentalMark: true,
}
