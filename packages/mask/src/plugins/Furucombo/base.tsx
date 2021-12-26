import type { Plugin } from '@masknet/plugin-infra'
import { PLUGIN_ID } from './constants'
import { FurucomboIcon } from '../../resources/FurucomboIcon'

export const base: Plugin.Shared.Definition = {
    ID: PLUGIN_ID,
    icon: <FurucomboIcon />,
    name: { fallback: 'Furucombo' },
    description: {
        fallback: 'Furucombo is a tool built for end-users to optimize their DeFi strategy simply by drag and drop.',
    },
    publisher: { name: { fallback: 'SebastianLF' }, link: 'https://github.com/SebastianLF' },
    enableRequirement: {
        architecture: { app: true, web: true },
        networks: { type: 'opt-out', networks: {} },
        target: 'stable',
    },
}
