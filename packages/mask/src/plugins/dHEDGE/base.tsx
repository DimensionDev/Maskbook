import type { Plugin } from '@masknet/plugin-infra'
import { DHEDGE_PLUGIN_ID } from './constants'
import { DHEDGEIcon } from '../../resources/DHEDGEIcon'

export const base: Plugin.Shared.Definition = {
    ID: DHEDGE_PLUGIN_ID,
    icon: <DHEDGEIcon />,
    name: { fallback: 'dHEDGE' },
    description: { fallback: 'Decentralized hedge funds on Ethereum.' },
    publisher: { name: { fallback: 'iRhonin' }, link: 'https://github.com/iRhonin' },
    enableRequirement: {
        architecture: { app: true, web: true },
        networks: { type: 'opt-out', networks: {} },
        target: 'stable',
    },
}
