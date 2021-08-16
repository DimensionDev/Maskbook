export * from './i18n_generated'
import { createI18NBundle } from '@masknet/shared'
import en from './en-US.json'
import zh from './zh-TW.json'
import jp from './ja-JP.json'
import ko from './ko-KR.json'

export const addDashboardI18N = createI18NBundle('dashboard', {
    en,
    zh,
    jp,
    ko,
})
