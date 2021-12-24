import type { Plugin } from '@masknet/plugin-infra'
import { languages } from './locales/languages'

export const base: Plugin.Shared.Definition = {
    ID: 'io.mask.example',
    icon: '🤔',
    name: { fallback: 'Mask Example Plugin' },
    description: { fallback: 'An example plugin of Mask Network.' },
    publisher: { name: { fallback: 'Mask Network' }, link: 'https://mask.io/' },
    enableRequirement: {
        architecture: { app: false, web: true },
        networks: { type: 'opt-out', networks: {} },
        target: 'insider',
    },
    experimentalMark: true,
    i18n: languages,
}
