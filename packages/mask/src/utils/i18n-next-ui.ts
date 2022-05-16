import { useTranslation, UseTranslationOptions } from 'react-i18next'
import type en from '../../shared-ui/locales/en-US.json'
import type { i18NextInstance, TranslateOptions } from '@masknet/shared-base'
import { SupportedLanguages } from '@masknet/public-api'

type PluralsSuffix = 'zero' | 'one' | 'two' | 'few' | 'many' | 'other'

type LocaleKeys = keyof typeof en
type ExtendBaseKeys<K> = K extends `${infer B}$${string}` ? B | K : K extends `${infer B}_${PluralsSuffix}` ? B | K : K
type AvailableLocaleKeys = ExtendBaseKeys<LocaleKeys>

export type I18NFunction = <TKeys extends AvailableLocaleKeys>(
    key: TKeys | TKeys[],
    // defaultValue?: string,
    options?: TranslateOptions | string,
) => string

/**
 * Enhanced version of useTranslation
 * @param opt Options
 */
export function useI18N(opt?: UseTranslationOptions): {
    t: I18NFunction
    i18n: typeof i18NextInstance
    ready: boolean
} {
    return useTranslation('mask', opt)
}

export function useLanguage(): SupportedLanguages {
    const { i18n } = useTranslation()
    const lang = i18n.language
    if (lang in SupportedLanguages) return lang as any
    return SupportedLanguages.enUS
}
