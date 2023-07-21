// ! This file is used during SSR. DO NOT import new files that does not work in SSR

import { useTranslation, type UseTranslationOptions } from 'react-i18next'
import type en from '../../shared-ui/locales/en-US.json'
import type { i18NextInstance } from '@masknet/shared-base'
import type { TFunction } from 'i18next'

type PluralsSuffix = 'zero' | 'one' | 'two' | 'few' | 'many' | 'other'

type LocaleKeys = keyof typeof en
type ExtendBaseKeys<K> = K extends `${infer B}$${string}` ? B | K : K extends `${infer B}_${PluralsSuffix}` ? B | K : K
export type AvailableLocaleKeys = ExtendBaseKeys<LocaleKeys>

let _f: TFunction
export type I18NFunction = typeof _f<keyof typeof en, any, any>

/**
 * Enhanced version of useTranslation
 * @param opt Options
 */
export function useI18N(opt?: UseTranslationOptions<undefined> | undefined): {
    t: I18NFunction
    i18n: typeof i18NextInstance
    ready: boolean
} {
    return useTranslation('mask', opt) as any
}
