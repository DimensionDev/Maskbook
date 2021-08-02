import i18nNextInstance from 'i18next'
import en from '../_locales/en/messages.json' // english
import zh from '../_locales/zh/messages.json' // traditional chinese
import ko from '../_locales/ko/messages.json' // korean
import ja from '../_locales/ja/messages.json' // japanese
import { addMaskSharedI18N } from '@masknet/shared'
import type { I18NFunction } from './i18n-next-ui'
// @ts-ignore in case circle dependency make typescript complains
import { addDashboardI18N } from '@masknet/dashboard'
export type I18NStrings = typeof en

function removeEmpty(lang: Record<string, string>) {
    return Object.fromEntries(Object.entries(lang).filter((x) => x[1].length))
}
i18nNextInstance.init({
    resources: {
        en: { translation: en },
        zh: { translation: removeEmpty(zh) },
        ko: { translation: removeEmpty(ko) },
        ja: { translation: removeEmpty(ja) },
    },
    keySeparator: false,
    interpolation: {
        // react already safes from xss
        escapeValue: false,
    },
    fallbackLng: 'en',
})
addMaskSharedI18N(i18nNextInstance)
addDashboardI18N(i18nNextInstance)
i18nNextInstance.languages = ['en', 'zh', 'ko', 'ja']

if (import.meta.webpackHot) {
    import.meta.webpackHot.accept(
        [
            '../_locales/en/messages.json',
            '../_locales/zh/messages.json',
            '../_locales/ko/messages.json',
            '../_locales/ja/messages.json',
        ],
        () => {
            i18nNextInstance.addResources('zh', 'translation', zh)
            i18nNextInstance.addResources('en', 'translation', en)
            i18nNextInstance.addResources('ko', 'translation', ko)
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
