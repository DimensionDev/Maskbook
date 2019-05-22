import { GetContext } from '@holoflows/kit/es'
import { getUrl } from './utils'

type I18NStrings = typeof import('../../public/_locales/en/messages.json')
export function geti18nString(key: keyof I18NStrings, substitutions: string | string[] = '') {
    const context = GetContext()
    if (context === 'background' || context === 'content' || context === 'options')
        return browser.i18n.getMessage(key, substitutions)
    else {
        const langs: Record<string, I18NStrings> = {
            en: getUrl('/_locales/en/messages.json') as any,
            zh: getUrl('/_locales/zh/messages.json') as any,
        }
        const lang = langs[navigator.language.split('-')[0] as any] || langs.en
        const string = lang[key] || langs.en[key]
        // tslint:disable-next-line: no-parameter-reassignment
        if (typeof substitutions === 'string') substitutions = [substitutions]
        if (substitutions.length > 2) console.error('Implement this please')
        return string.message.replace('$1', substitutions[0]).replace('$2', substitutions[1])
    }
}
