import type { Plugin } from '@masknet/plugin-infra'
import { CYBERCONNECT_PLUGIN_ID } from './constants'
import { CyberConnectIcon } from '../../resources/CyberConnectIcon'
export const base: Plugin.Shared.Definition = {
    ID: CYBERCONNECT_PLUGIN_ID,
    icon: <CyberConnectIcon />,
    name: { fallback: 'CyberConnect' },
    description: {
        fallback: 'A plugin for https://cyberconnect.me/',
    },
    publisher: { name: { fallback: 'Mask Network' }, link: 'https://mask.io/' },
    enableRequirement: {
        architecture: { app: false, web: true },
        networks: { type: 'opt-out', networks: {} },
        target: 'stable',
    },
}
