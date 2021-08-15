import i18n from 'i18next'
import Detector from 'i18next-browser-languagedetector'
import { addSharedI18N, fallbackLng } from '@masknet/shared'
import { addDashboardI18N } from '../locales'
import { initReactI18next } from 'react-i18next'

i18n.use(Detector).init({
    keySeparator: false,
    interpolation: {
        escapeValue: false,
    },
    fallbackLng,
    nonExplicitSupportedLngs: true,
    detection: {
        order: ['navigator'],
    },
})
i18n.use(initReactI18next)
addSharedI18N(i18n)
addDashboardI18N(i18n)
