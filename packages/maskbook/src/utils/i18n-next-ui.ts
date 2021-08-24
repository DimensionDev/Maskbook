/// <reference path="../polyfill/global.d.ts" />
import type { i18n } from 'i18next'
import { initReactI18next, useTranslation as useTranslation_, UseTranslationOptions } from 'react-i18next'
import type { TOptions } from 'i18next'
import { useEffect } from 'react'
import { useUpdate } from 'react-use'
import type en from '../locales/en-US.json'
import i18nNextInstance from './i18n-next'
import { languageSettings } from '../settings/settings'
import { LanguageOptions, SupportedLanguages } from '@masknet/public-api'
import { languages } from '../locales'

i18nNextInstance.use(initReactI18next)

export type I18NFunction = <TKeys extends keyof typeof en>(
    key: TKeys | TKeys[],
    // defaultValue?: string,
    options?: TOptions | string,
) => typeof en[TKeys]

/**
 * Enhanced version of useTranslation
 * @param opt Options
 */
export function useI18N(opt?: UseTranslationOptions): {
    t: I18NFunction
    i18n: i18n
    ready: boolean
} {
    if (process.env.NODE_ENV === 'development') {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        const update = useUpdate()
        // eslint-disable-next-line react-hooks/rules-of-hooks
        useEffect(() => {
            document.addEventListener('i18n-hmr', update)
            return () => document.removeEventListener('i18n-hmr', update)
        }, [])
    }
    return useTranslation_('mask', opt)
}

export function useLanguage(): SupportedLanguages {
    const { i18n } = useTranslation_()
    const lang = i18n.language
    if (lang in SupportedLanguages) return lang as any
    return SupportedLanguages.enUS
}

languageSettings.addListener((next): void => {
    if (next === LanguageOptions.__auto__) {
        const result: string[] = i18nNextInstance.services.languageDetector.detect()
        for (const lng of result) {
            if (lng in languages) return void i18nNextInstance.changeLanguage(lng)
        }
        i18nNextInstance.changeLanguage(LanguageOptions.enUS)
    } else {
        i18nNextInstance.changeLanguage(next)
    }
})
