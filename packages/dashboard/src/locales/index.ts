export * from './i18n_generated'
import { createI18NBundle } from '@masknet/shared'
import en from './en.json'
import zh from './zh.json'
import jp from './ja.json'
import ko from './ko.json'

export const addDashboardI18N = createI18NBundle('dashboard', {
    en,
    zh,
    jp,
    ko,
})
