import { LanguageOptions } from '@masknet/public-api'
import i18n from 'i18next'
import Detector from 'i18next-browser-languagedetector'
import { debounce, DebouncedFunc } from 'lodash-es'

export const i18NextInstance = i18n.default || i18n
if (process.env.NODE_ENV === 'development') {
    if (Reflect.get(globalThis, '__mask_shared_base__')) {
        throw new Error('@masknet/shared-base initialized twice. Please check your code.')
    }

    Reflect.defineProperty(globalThis, '__mask_shared_base__', { value: true })
}

if (!i18NextInstance.isInitialized) {
    i18NextInstance.use(Detector.default || Detector).init({
        keySeparator: false,
        interpolation: { escapeValue: true },
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
        const result: string[] = i18NextInstance.services.languageDetector.detect()
        i18n.changeLanguage(result[0] || LanguageOptions.enUS)
    } else {
        i18n.changeLanguage(next)
    }
}

const cache = Symbol()
export function queryRemoteI18NBundle(
    _updater: (lang: string) => Promise<Array<[namespace: string, lang: string, json: object]>>,
) {
    const updater: typeof _updater & { [cache]?: DebouncedFunc<() => Promise<void>> } = _updater as any
    const update = (updater[cache] ??= debounce(async () => {
        const result = await updater(i18NextInstance.language)
        for (const [ns, lang, json] of result) {
            i18NextInstance.addResourceBundle(lang, ns, json, true, true)
        }
    }, 1500))
    update()
    i18NextInstance.on('languageChanged', update)
    return () => i18NextInstance.off('languageChanged', update)
}

export type { TOptions as TranslateOptions } from 'i18next'
