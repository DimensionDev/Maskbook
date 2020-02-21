import i18nNextInstance from 'i18next'
import en from '../_locales/en/messages.json'
import zh from '../_locales/zh/messages.json'
import { I18NFunction } from './i18n-next-ui'
export type I18NStrings = typeof en

i18nNextInstance.init({
    resources: {
        en: { translation: en },
        zh: { translation: zh },
    },
    lng: 'en',
    keySeparator: false,
    interpolation: {
        // react already safes from xss
        escapeValue: false,
    },
    fallbackLng: 'en',
})

export default i18nNextInstance
export const i18n = {
    t: ((key, options) => {
        return i18nNextInstance.t(key, options)
    }) as I18NFunction<typeof en>,
}
