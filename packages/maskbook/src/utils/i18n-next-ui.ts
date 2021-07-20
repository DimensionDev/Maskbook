/// <reference path="../polyfill/global.d.ts" />
import type { i18n } from 'i18next'
import { initReactI18next, useTranslation as useTranslation_, UseTranslationOptions } from 'react-i18next'
import type { TOptions } from 'i18next'
import { useMemo, useCallback, useEffect } from 'react'
import { useUpdate } from 'react-use'
import type en from '../_locales/en/messages.json'
import i18nNextInstance from './i18n-next'
import { languageSettings } from '../settings/settings'

i18nNextInstance.use(initReactI18next)

// const test = {
//     my_test: 'string',
// } as const
type Namespaces = {
    default: typeof en
    // test: typeof test
}

export type I18NFunction<TInterpolationMap extends object = typeof en> = <TKeys extends keyof TInterpolationMap>(
    key: TKeys | TKeys[],
    // defaultValue?: string,
    options?: TOptions | string,
) => TInterpolationMap[TKeys]

/**
 * Enhanced version of useTranslation
 * @param ns Namespace
 * @param opt Options
 */
export function useI18N<NS extends keyof Namespaces = 'default'>(
    _ns?: NS,
    opt?: UseTranslationOptions,
    // The [F, i18n, boolean] case is not recommend because i18n ally doesn't recognize that if the name is not "t"
): /** [F<Namespaces[NS]>, i18n, boolean] &  */
{
    t: I18NFunction<Namespaces[NS]>
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
    return useTranslation_(undefined, opt)
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
