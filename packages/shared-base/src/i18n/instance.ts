import { LanguageOptions } from '@masknet/public-api'
import i18n from 'i18next'
import Detector from 'i18next-browser-languagedetector'

export const i18NextInstance = i18n
if (process.env.NODE_ENV === 'development') {
    if (Reflect.get(globalThis, '__mask_shared_base__')) {
        throw new Error('@masknet/shared-base initialized twice. Please check your code.')
    }

    Reflect.defineProperty(globalThis, '__mask_shared_base__', { value: true })
}

if (!i18n.isInitialized) {
    i18n.use(Detector).init({
        keySeparator: false,
        interpolation: { escapeValue: false },
        contextSeparator: '$',
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
}
export function updateLanguage(next: LanguageOptions) {
    if (next === LanguageOptions.__auto__) {
        const result: string[] = i18n.services.languageDetector.detect()
        i18n.changeLanguage(result[0] || LanguageOptions.enUS)
    } else {
        i18n.changeLanguage(next)
    }
}

export type { TOptions as TranslateOptions } from 'i18next'
