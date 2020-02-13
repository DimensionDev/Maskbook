import i18n from 'i18next'
import en from '../_locales/en/messages.json'
import zh from '../_locales/zh/messages.json'

i18n.init({
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

export default i18n
