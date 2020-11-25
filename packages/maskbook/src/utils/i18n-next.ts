import i18nNextInstance from 'i18next'
import * as maskbookTranslation from '../_locales'
import type { I18NFunction } from './i18n-next-ui'
export type I18NStrings = typeof import('../_locales/en/messages.json')
export type Translation = Record<string, string> | { default: Record<string, string> }
export type TranslationBundle = Record<string, Translation | Promise<Translation>>
export async function insertI18NBundle(namespace: string, _bundle: TranslationBundle | Promise<TranslationBundle>) {
    const bundle: TranslationBundle = await _bundle
    for (const lng in bundle) {
        const resource: Translation = await bundle[lng]
        type T = Record<string, string>
        const translation = (typeof resource.default === 'object' ? resource.default : resource) as T
        i18nNextInstance.addResourceBundle(lng, namespace, removeEmpty(translation), false, true)
        document.dispatchEvent(new Event(namespace + '-i18n-hmr'))
    }
}
const add = () => insertI18NBundle('maskbook', maskbookTranslation)
add()
if (module.hot) module.hot.accept('../_locales', add)
function removeEmpty(lang: Record<string, string>) {
    return Object.fromEntries(Object.entries(lang).filter((x) => x[1].length))
}
i18nNextInstance.init({
    resources: {},
    keySeparator: false,
    interpolation: {
        // react already safes from xss
        escapeValue: false,
    },
    fallbackLng: 'en',
})
i18nNextInstance.languages = ['en', 'zh', 'ja']

export default i18nNextInstance
export const i18n = {
    t: ((key, options) => i18nNextInstance.t(key, options)) as I18NFunction<I18NStrings>,
}
