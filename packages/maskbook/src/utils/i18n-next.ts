import i18nNextInstance from 'i18next'
import Detector from 'i18next-browser-languagedetector'
import type { I18NFunction } from './i18n-next-ui'

import { addMaskI18N } from '../locales'
import { addSharedI18N, fallbackLng } from '@masknet/shared'
// @ts-ignore in case circle dependency make typescript complains
import { addDashboardI18N } from '@masknet/dashboard'

i18nNextInstance.use(Detector).init({
    keySeparator: false,
    interpolation: { escapeValue: false },
    fallbackLng,
    defaultNS: 'mask',
    nonExplicitSupportedLngs: true,
    detection: {
        order: ['navigator'],
    },
})

addMaskI18N(i18nNextInstance)
addSharedI18N(i18nNextInstance)
addDashboardI18N(i18nNextInstance)

export default i18nNextInstance
export const i18n = {
    t: ((key, options) => {
        return i18nNextInstance.t(key, options)
    }) as I18NFunction,
}
