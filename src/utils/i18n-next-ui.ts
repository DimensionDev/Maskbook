import i18nLocal from './i18n-next'
import { i18n } from 'i18next'
import { initReactI18next, useTranslation as useTranslation_, UseTranslationOptions } from 'react-i18next'
import en from '../_locales/en/messages.json'
import { StringMap, TOptions } from 'i18next'
i18nLocal.use(initReactI18next)

// const test = {
//     my_test: 'string',
// } as const
type Namespaces = {
    default: typeof en
    // test: typeof test
}

type F<TInterpolationMap extends object = StringMap> = <TKeys extends keyof TInterpolationMap>(
    key: TKeys | TKeys[],
    defaultValue?: string,
    options?: TOptions<TInterpolationMap> | string,
) => TInterpolationMap[TKeys]

/**
 * Enhanced version of useTranslation
 * @param ns Namespace
 * @param opt Options
 */
export function useI18N<NS extends keyof Namespaces = 'default'>(
    opt?: UseTranslationOptions,
    // The [F, i18n, boolean] case is not recommend because i18n ally doesn't recognize that if the name is not "t"
): /** [F<Namespaces[NS]>, i18n, boolean] &  */
{
    t: F<Namespaces[NS]>
    i18n: i18n
    ready: boolean
} {
    return useTranslation_(undefined, opt)
}

export default i18n
