import { i18n } from 'i18next'
import { initReactI18next, useTranslation as useTranslation_, UseTranslationOptions } from 'react-i18next'
import { TOptions } from 'i18next'
import React from 'react'
import en from '../_locales/en/messages.json'
import i18nNextInstance from './i18n-next'
import { languageSettings } from '../components/shared-settings/settings'

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
    return useTranslation_(undefined, opt)
}

languageSettings.addListener(next => {
    i18nNextInstance.changeLanguage(next)
})

export function useIntlListFormat() {
    const formatter = React.useMemo(() => {
        return new Intl.ListFormat({ type: 'conjunction' })
    }, [])
    return React.useCallback((list: string[]) => formatter.format(list), [formatter])
}

// See: https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/ListFormat
declare namespace Intl {
    interface ListFormatOptions {
        localeMatcher: 'lookup' | 'best fit'
        type: 'conjunction' | 'disjunction' | 'unit'
        style: 'long' | 'short' | 'narrow'
    }
    class ListFormat {
        constructor(options?: Partial<ListFormatOptions>)
        constructor(locales?: string, options?: Partial<ListFormatOptions>)
        format(str: string[]): string
    }
}

// A simple polyfill. Enough for us.
if (!Intl.ListFormat) {
    Intl.ListFormat = class {
        constructor(public locales?: string | Partial<Intl.ListFormatOptions>, options?: Intl.ListFormatOptions) {}
        format(string: string[]) {
            const locale = typeof this.locales === 'string' ? this.locales : i18nNextInstance.language
            if (locale.startsWith('zh')) return string.join('、')
            return string.join(', ')
        }
    }
}
