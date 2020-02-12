import en from '../_locales/en/messages.json'
import zh from '../_locales/zh/messages.json'
import { GetContext } from '@holoflows/kit/es'
import { safeReact, safeGetActiveUI } from './safeRequire'
import { SocialNetworkUI } from '../social-network/ui'
import { languageSettings } from '../components/shared-settings/settings'

export type I18NStrings = typeof en

const langs: Record<string, I18NStrings> = {
    en,
    zh,
}
export function useIntlListFormat() {
    const React = safeReact()
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
            const locale = typeof this.locales === 'string' ? this.locales : getCurrentLanguageFull()
            if (locale.startsWith('zh')) return string.join('、')
            return string.join(', ')
        }
    }
}
export function geti18nString(key: keyof I18NStrings, substitutions: string | string[] = '') {
    let uiOverwrite: SocialNetworkUI['i18nOverwrite'] | undefined
    try {
        uiOverwrite = GetContext() === 'background' ? {} : safeGetActiveUI().i18nOverwrite
    } catch {}

    const currentLanguage = languageSettings.value ?? getCurrentLanguage()
    const uiLang = uiOverwrite?.[currentLanguage]
    const origLang = langs?.[currentLanguage]
    const uiFallback = uiOverwrite?.en
    const fallback = langs?.en

    type I18NStringsValue = string | undefined | { message: string }
    const string = (uiLang?.[key] || origLang?.[key] || uiFallback?.[key] || fallback?.[key]) as I18NStringsValue
    if (typeof substitutions === 'string') substitutions = [substitutions]
    if (substitutions.length > 4) console.error('Implement this please')
    return ((typeof string === 'string' ? string : string?.message) ?? key)
        .replace('$1', substitutions[0])
        .replace('$2', substitutions[1])
        .replace('$3', substitutions[2])
        .replace('$4', substitutions[3])
}
let I18nContext: React.Context<string>
export function geti18nContext() {
    if (!I18nContext) I18nContext = safeReact().createContext<string>('en')
    return I18nContext
}
export function getCurrentLanguage() {
    try {
        return safeReact().useContext(I18nContext)
    } catch {}
    return navigator.language.split('-')[0]
}

function getCurrentLanguageFull() {
    try {
        return safeReact().useContext(I18nContext)
    } catch {}
    return navigator.language
}
