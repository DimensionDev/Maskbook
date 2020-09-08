import i18nNextInstance from 'i18next'
import en from '../_locales/en/messages.json'
import zh from '../_locales/zh/messages.json'
import ja from '../_locales/ja/messages.json'
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
i18nNextInstance.languages = ['en', 'zh', 'ja']

export default i18nNextInstance
export const i18n = {
    t: ((key, options) => {
        return i18nNextInstance.t(key, options)
    }) as I18NFunction<typeof en>,
}
