export * from './i18n_generated'
import { createI18NBundle } from '@dimensiondev/maskbook-shared'
import en from './en.json'
import zh from './zh.json'
import ja from './ja.json'
export const addMaskThemeI18N = createI18NBundle('theme', {
    en,
    zh,
    ja,
})
