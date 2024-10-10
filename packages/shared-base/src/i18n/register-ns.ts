import type { i18n } from 'i18next'
import type { I18n, Messages } from '@lingui/core'

type I18NResource = I18NLanguageResourcePair | LinguiI18NResource
type I18NKeyValuePair = Record<string, string>
type I18NLanguageResourcePair = Record<string, I18NKeyValuePair>
type LinguiI18NResource = Record<string, { messages: Messages }>
function addI18NBundle(i18Next: i18n, lingui: I18n, namespace: string, langs: I18NResource[] | I18NResource) {
    if (!i18Next.addResourceBundle) throw new TypeError('Please call instance.init() first')

    try {
        // not enable hmr for MV3
        if (process.env.NODE_ENV === 'development' && !('importScripts' in globalThis)) {
            globalThis.addEventListener('MASK_I18N_HMR', (e) => {
                const [ns, langs] = (e as CustomEvent).detail
                if (namespace !== ns) return
                addI18NBundleSingle(i18Next, lingui, namespace, langs)
            })
            globalThis.addEventListener('MASK_I18N_HMR_LINGUI', (e) => {
                const langs = (e as CustomEvent).detail
                addI18NBundleSingle(i18Next, lingui, namespace, langs)
            })
        }
    } catch {
        // ignore
    }
    if (Array.isArray(langs)) langs.forEach((lang) => addI18NBundleSingle(i18Next, lingui, namespace, lang))
    else addI18NBundleSingle(i18Next, lingui, namespace, langs)
}
function addI18NBundleSingle(i18Next: i18n, lingui: I18n, namespace: string, langs: I18NResource) {
    if (isI18NLanguageResourcePair(langs)) {
        for (const lang of Object.keys(langs)) {
            i18Next.addResourceBundle(lang, namespace, removeEmptyString(langs[lang]))
        }
    } else {
        // see https://github.com/lingui/js-lingui/issues/2021
        const en = structuredClone(langs.en.messages)
        const zh = structuredClone(langs.zh.messages)
        const zh_CN = structuredClone(langs['zh-CN'].messages)
        const ja = structuredClone(langs.ja.messages)
        const ko = structuredClone(langs.ko.messages)

        // Don't fallback to en in the translation file
        ;[zh, zh_CN, ja, ko].forEach((lang) => {
            for (const key in lang) {
                if (typeof en[key] === 'string' && lang[key] === en[key]) delete lang[key]
            }
        })

        // zh and zh_CN can fallback to each other
        for (const key in zh) if (!zh_CN[key]) zh_CN[key] = zh[key]
        for (const key in zh_CN) if (!zh[key]) zh[key] = zh_CN[key]
        lingui.load({ en, zh, 'zh-CN': zh_CN, ja, ko })
    }
}
function isI18NLanguageResourcePair(value: I18NResource): value is I18NLanguageResourcePair {
    for (const key in value) {
        if ('messages' in value[key] && typeof value[key].messages === 'object') return false
    }
    return true
}

export function createI18NBundle(namespace: string, langs: I18NResource[] | I18NResource) {
    return (i18Next: i18n, lingui: I18n) => addI18NBundle(i18Next, lingui, namespace, langs)
}

function removeEmptyString(lang: Partial<I18NKeyValuePair>): I18NKeyValuePair {
    const next: Partial<I18NKeyValuePair> = {}
    for (const key in lang) {
        if (lang[key]) next[key] = lang[key]
    }
    return next as I18NKeyValuePair
}
