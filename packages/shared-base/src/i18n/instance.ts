import { LanguageOptions } from '@masknet/public-api'
import i18n from 'i18next'
import Detector from 'i18next-browser-languagedetector'

export const i18NextInstance = i18n

i18n.use(Detector).init({
    keySeparator: false,
    interpolation: { escapeValue: false },
    fallbackLng: {
        'zh-CN': ['zh-TW', 'en'],
        'zh-TW': ['zh-CN', 'en'],
        default: ['en'],
    },
    defaultNS: 'mask',
    nonExplicitSupportedLngs: true,
    detection: {
        order: ['navigator'],
    },
})

export function updateLanguage(next: LanguageOptions) {
    if (next === LanguageOptions.__auto__) {
        const result: string[] = i18n.services.languageDetector.detect()
        i18n.changeLanguage(result[0] || LanguageOptions.enUS)
    } else {
        i18n.changeLanguage(next)
    }
}

export type { TOptions as TranslateOptions } from 'i18next'
