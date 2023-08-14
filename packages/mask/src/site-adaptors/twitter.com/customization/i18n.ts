import type { SiteAdaptorUI } from '@masknet/types'
import { languages } from '../locales/languages.js'

export const i18NOverwriteTwitter: SiteAdaptorUI.Customization.I18NOverwrite = {
    mask: {},
}
const resource = languages
for (const language of Object.keys(resource) as Array<keyof typeof resource>) {
    for (const key of Object.keys(resource[language]) as Array<keyof (typeof resource)[typeof language]>) {
        i18NOverwriteTwitter.mask[key] ??= {}
        i18NOverwriteTwitter.mask[key][language] = resource[language][key]
    }
}
