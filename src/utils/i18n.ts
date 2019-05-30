import { GetContext } from '@holoflows/kit/es'
import { getUrl } from './utils'

type I18NStrings = typeof import('../../public/_locales/en/messages.json')
const context = GetContext()
const useChromeIntl = context === 'background' || context === 'content' || context === 'options'
function syncXHR(url: string) {
    if (context !== 'debugging') throw new TypeError("Don't do this")
    const request = new XMLHttpRequest()
    request.open('GET', url, false)
    request.send(null)

    return JSON.parse(request.responseText)
}
const langs: Record<string, I18NStrings> = {
    en: undefined!,
    zh: undefined!,
}
if (context === 'debugging') {
    const key = ['en', 'zh']
    key.forEach(k => (langs[k] = syncXHR('/_locales/' + k + '/messages.json')))
}
export function geti18nString(key: keyof I18NStrings, substitutions: string | string[] = '') {
    if (useChromeIntl) return browser.i18n.getMessage(key, substitutions)
    else if (context === 'debugging') {
        const lang = langs[navigator.language.split('-')[0]] || langs.en
        const string = lang[key] || langs.en[key]
        // tslint:disable-next-line: no-parameter-reassignment
        if (typeof substitutions === 'string') substitutions = [substitutions]
        if (substitutions.length > 3) console.error('Implement this please')
        return (string || { message: key }).message
            .replace('$1', substitutions[0])
            .replace('$2', substitutions[1])
            .replace('$3', substitutions[2])
    } else {
        console.error('Unknown environment for sync i18n')
        return 'Unknown environment for sync i18n'
    }
}
