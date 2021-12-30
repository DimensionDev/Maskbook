import i18nNextInstance from 'i18next'
import type { TOptions } from 'i18next'
import type en from '../locales/en-US.json'
import Detector from 'i18next-browser-languagedetector'

import { addMaskI18N } from '../locales/languages'
import { addSharedI18N } from '@masknet/shared'
import { fallbackLng } from '@masknet/shared-base'
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

// Deprecates. Prefer useMaskI18n()
export const i18n = {
    t: ((key, options) => {
        return i18nNextInstance.t(key, options)
    }) as I18NFunction,
}

export type I18NFunction = <TKeys extends keyof typeof en>(
    key: TKeys | TKeys[],
    // defaultValue?: string,
    options?: TOptions | string,
) => typeof en[TKeys]
