import en from '../_locales/en/messages.json'
import zh from '../_locales/zh/messages.json'
import React from 'react'

type I18NStrings = typeof en

const langs: Record<string, I18NStrings> = {
    en,
    zh,
}
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
            const locale = typeof this.locales === 'string' ? this.locales : getCurrentLanguageFull()
            if (locale.startsWith('zh')) return string.join('、')
            return string.join(', ')
        }
    }
}
export function geti18nString(key: keyof I18NStrings, substitutions: string | string[] = '') {
    const lang = langs[getCurrentScript()] || langs.en
    const string = lang[key] || langs.en[key]
    if (typeof substitutions === 'string') substitutions = [substitutions]
    if (substitutions.length > 3) console.error('Implement this please')
    return (string || { message: key }).message
        .replace('$1', substitutions[0])
        .replace('$2', substitutions[1])
        .replace('$3', substitutions[2])
}
function getCurrentScript() {
    return navigator.language.split('-')[0]
}

function getCurrentLanguageFull() {
    return navigator.language
}
