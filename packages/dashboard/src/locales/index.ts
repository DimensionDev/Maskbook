export * from './i18n_generated'
import { createI18NBundle } from '@masknet/shared'
import en from './en.json'
import zh from './zh.json'
export const addDashboardI18N = createI18NBundle('dashboard', {
    en,
    zh,
})
