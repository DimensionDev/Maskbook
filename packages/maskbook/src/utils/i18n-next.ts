import i18nNextInstance from 'i18next'
import en from '../_locales/en/messages.json'
import zh from '../_locales/zh/messages.json'
import ja from '../_locales/ja/messages.json'
import { addMaskThemeI18N } from '@dimensiondev/maskbook-theme'
import type { I18NFunction } from './i18n-next-ui'
export type I18NStrings = typeof en

function removeEmpty(lang: Record<string, string>) {
    return Object.fromEntries(Object.entries(lang).filter((x) => x[1].length))
}
i18nNextInstance.init({
    resources: {
        en: { translation: en },
        zh: { translation: removeEmpty(zh) },
        ja: { translation: removeEmpty(ja) },
    },
    keySeparator: false,
    interpolation: {
        // react already safes from xss
        escapeValue: false,
    },
    fallbackLng: 'en',
})
addMaskThemeI18N(i18nNextInstance)
i18nNextInstance.languages = ['en', 'zh', 'ja']

if (module.hot) {
    module.hot.accept(
        ['../_locales/en/messages.json', '../_locales/zh/messages.json', '../_locales/ja/messages.json'],
        () => {
            i18nNextInstance.addResources('zh', 'translation', zh)
            i18nNextInstance.addResources('en', 'translation', en)
            i18nNextInstance.addResources('ja', 'translation', ja)
            document.dispatchEvent(new Event('i18n-hmr'))
        },
    )
}

export default i18nNextInstance
export const i18n = {
    t: ((key, options) => {
        return i18nNextInstance.t(key, options)
    }) as I18NFunction<typeof en>,
}
