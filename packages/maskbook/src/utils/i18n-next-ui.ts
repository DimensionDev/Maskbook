/// <reference path="../polyfill/global.d.ts" />
import type { i18n } from 'i18next'
import { initReactI18next, useTranslation as useTranslation_, UseTranslationOptions } from 'react-i18next'
import type { TOptions } from 'i18next'
import { useMemo, useCallback, useEffect } from 'react'
import type en from '../_locales/en/messages.json'
import i18nNextInstance from './i18n-next'
import { languageSettings } from '../settings/settings'
import { useUpdate } from 'react-use'

i18nNextInstance.use(initReactI18next)

export type I18NFunction<TInterpolationMap extends object = typeof en> = <TKeys extends keyof TInterpolationMap>(
    key: TKeys | TKeys[],
    // defaultValue?: string,
    options?: TOptions | string,
) => TInterpolationMap[TKeys]

export type i18nHooksResult<T extends object> = {
    t: I18NFunction<T>
    i18n: i18n
    ready: boolean
}
/**
 * Enhanced version of useTranslation
 * @param opt Options
 */
export const useI18N = createI18NHooksNS<typeof import('../_locales/en/messages.json')>('maskbook')
export function createI18NHooksNS<T extends object>(namespace: string) {
    return (opt?: UseTranslationOptions): i18nHooksResult<T> => {
        if (process.env.NODE_ENV === 'development') {
            const update = useUpdate()
            useEffect(() => document.addEventListener(namespace + '-i18n-hmr', update))
        }
        return useTranslation_(namespace, opt)
    }
}

languageSettings.addListener((next) => {
    i18nNextInstance.changeLanguage(next)
})

export function useIntlListFormat() {
    const formatter = useMemo(() => {
        return new Intl.ListFormat({ type: 'conjunction' })
    }, [])
    return useCallback((list: string[]) => formatter.format(list), [formatter])
}
