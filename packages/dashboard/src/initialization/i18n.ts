import i18n from 'i18next'
import { addMaskThemeI18N } from '@dimensiondev/maskbook-theme'
import { addDashboardI18N } from '../locales'
import { initReactI18next } from 'react-i18next'

i18n.init({
    resources: {},
    keySeparator: false,
    interpolation: { escapeValue: false },
    fallbackLng: 'en',
})
i18n.use(initReactI18next)
addMaskThemeI18N(i18n)
addDashboardI18N(i18n)
