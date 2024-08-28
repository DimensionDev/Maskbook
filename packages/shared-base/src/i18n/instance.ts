import { LanguageOptions } from '@masknet/public-api'
import i18n from 'i18next'
import Detector from 'i18next-browser-languagedetector'
import { debounce, type DebouncedFunc } from 'lodash-es'

export const i18NextInstance = i18n.default || i18n
if (process.env.NODE_ENV === 'development') {
    if (Reflect.get(globalThis, '__mask_shared_base__')) {
        console.error('@masknet/shared-base has been already initialized . Please check your code.')
    } else {
        Reflect.defineProperty(globalThis, '__mask_shared_base__', { value: true })
    }
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
        react: {
            bindI18n: 'languageChanged loaded',
            // We'll be getting bundles in different languages from the remote, and we'll need to trigger re-rendering.
            // https://react.i18next.com/latest/i18next-instance
            bindI18nStore: 'added removed',
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

const cache = Symbol('shared-base i18n cache')
const interpolationLike = /({{.+?}})/g
function getInterpolations(string: string) {
    return [...string.matchAll(interpolationLike)]
        .map((arr) => arr[0])
        .sort(undefined)
        .join('')
}
export function queryRemoteI18NBundle(
    _updater: (lang: string) => Promise<Array<[namespace: string, lang: string, json: Record<string, string>]>>,
) {
    const updater: typeof _updater & { [cache]?: DebouncedFunc<() => Promise<void>> } = _updater as any
    const update = (updater[cache] ??= debounce(async () => {
        const result = await updater(i18NextInstance.language)
        for (const [ns, lang, json] of result) {
            const next = { ...i18NextInstance.getResourceBundle(lang, ns) }
            for (const key in json) {
                const value = json[key]
                if (typeof value !== 'string') continue
                if (!next[key]) next[key] = value
                // we only accept i18n hot update if and only if the interpolations are the same, otherwise the translation will be broken.
                else if (getInterpolations(value) === next[key]) {
                    next[key] = value
                }
            }
            i18NextInstance.addResourceBundle(lang, ns, next, true, true)
        }
    }, 1500))
    update()
    i18NextInstance.on('languageChanged', update)
    return () => i18NextInstance.off('languageChanged', update)
}

export type { TOptions as TranslateOptions } from 'i18next'
