import en from '../_locales/en/messages.json'
import zh from '../_locales/zh/messages.json'

type I18NStrings = typeof en

const langs: Record<string, I18NStrings> = {
    en,
    zh,
}
export function geti18nString(key: keyof I18NStrings, substitutions: string | string[] = '') {
    const lang = langs[navigator.language.split('-')[0]] || langs.en
    const string = lang[key] || langs.en[key]
    if (typeof substitutions === 'string') substitutions = [substitutions]
    if (substitutions.length > 3) console.error('Implement this please')
    return (string || { message: key }).message
        .replace('$1', substitutions[0])
        .replace('$2', substitutions[1])
        .replace('$3', substitutions[2])
}
