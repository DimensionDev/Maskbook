import { createI18NBundle } from '../i18n/register-ns'

export * from './i18n_generated'
import en from './en.json'
import zh from './zh.json'
import ja from './ja.json'
export const addMaskSharedI18N = createI18NBundle('theme', {
    en,
    zh,
    ja,
})
