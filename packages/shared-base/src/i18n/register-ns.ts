import type { i18n } from 'i18next'

export function addI18NBundle(instance: i18n, namespace: string, langs: Record<string, object>) {
    if (!instance.addResourceBundle) throw new TypeError('Please call instance.init() first')
    for (const lang in langs) {
        instance.addResourceBundle(lang, namespace, removeEmptyString(langs[lang]))
    }
}

export function createI18NBundle(namespace: string, langs: Record<string, object>) {
    return (instance: i18n) => addI18NBundle(instance, namespace, langs)
}

function removeEmptyString(lang: object) {
    return Object.fromEntries(Object.entries(lang).filter((x) => x[1].length))
}
