import type { Plugin } from '@masknet/plugin-infra'
import { pluginDescription, pluginIcon, pluginName } from './constants'

export const base: Plugin.Shared.Definition = {
    ID: pluginName,
    icon: pluginIcon,
    name: { fallback: pluginName },
    description: { fallback: pluginDescription },
    publisher: { name: { fallback: 'Unlock Protocol' }, link: 'https://unlock-protocol.com/' },
    enableRequirement: {
        architecture: { app: true, web: true },
        networks: { type: 'opt-out', networks: {} },
        target: 'stable',
    },
}
