import { PLUGIN_ID, PLUGIN_NAME, PLUGIN_DESCRIPTION } from './constants'
import type { Plugin } from '@masknet/plugin-infra'

export const base: Plugin.Shared.Definition = {
    ID: PLUGIN_ID,
    name: { fallback: PLUGIN_NAME },
    description: { fallback: PLUGIN_DESCRIPTION },
    publisher: { name: { fallback: 'XiChi' }, link: 'https://github.com/xichi' },
    enableRequirement: {
        architecture: { app: true, web: true },
        networks: { type: 'opt-out', networks: {} },
        target: 'insider',
    },
    experimentalMark: true,
}
