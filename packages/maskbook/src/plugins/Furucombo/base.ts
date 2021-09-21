import type { Plugin } from '@masknet/plugin-infra'
import { languages } from './locales'
import { PLUGIN_ID, PLUGIN_NAME, PLUGIN_DESCRIPTION } from './constants'
import { FurucomboIcon } from '../../resources/FurucomboIcon'

export const base: Plugin.Shared.Definition = {
    ID: PLUGIN_ID,
    icon: FurucomboIcon,
    name: { fallback: PLUGIN_NAME },
    description: { fallback: PLUGIN_DESCRIPTION },
    publisher: { name: { fallback: 'Mask Network' }, link: 'https://mask.io/' },
    enableRequirement: {
        architecture: { app: false, web: true },
        networks: { type: 'opt-out', networks: {} },
        target: 'insider',
    },
    experimentalMark: true,
    i18n: languages,
}
