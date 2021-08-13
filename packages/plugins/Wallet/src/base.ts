import type { Plugin } from '@masknet/plugin-infra'
import { PLUGIN_DESCRIPTION, PLUGIN_ICON, PLUGIN_IDENTIFIER, PLUGIN_NAME } from './constants'
import en from './locales/en.json'
import zh from './locales/zh-TW.json'
import ko from './locales/ko.json'
import jp from './locales/ja.json'

export const base: Plugin.Shared.Definition = {
    ID: PLUGIN_IDENTIFIER,
    icon: PLUGIN_ICON,
    name: { fallback: PLUGIN_NAME },
    description: { fallback: PLUGIN_DESCRIPTION },
    publisher: { name: { fallback: 'Mask Network' }, link: 'https://mask.io/' },
    enableRequirement: {
        architecture: { app: true, web: true },
        networks: { type: 'opt-out', networks: {} },
        target: 'stable',
    },
    management: { alwaysOn: true },
    i18n: { en, zh, ko, jp },
}
