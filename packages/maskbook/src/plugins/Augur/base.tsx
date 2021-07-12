import type { Plugin } from '@masknet/plugin-infra'
import { AugurIcon } from '../../resources/AugurIcon'
import { AUGUR_PLUGIN_ID } from './constants'

export const base: Plugin.Shared.Definition = {
    ID: AUGUR_PLUGIN_ID,
    icon: <AugurIcon />,
    name: { fallback: 'Augur' },
    description: { fallback: 'Your global, no-limit betting platform' },
    publisher: { name: { fallback: 'iRhonin' }, link: 'https://github.com/iRhonin' },
    enableRequirement: {
        architecture: { app: false, web: true },
        networks: { type: 'opt-out', networks: {} },
        target: 'stable',
    },
}
