import type { I18n, Messages } from '@lingui/core'

type LinguiI18NResource = Record<string, { messages: Messages }>
function addI18NBundle(lingui: I18n, langs: LinguiI18NResource[] | LinguiI18NResource) {
    try {
        // not enable hmr for MV3
        if (process.env.NODE_ENV === 'development' && !('importScripts' in globalThis)) {
            globalThis.addEventListener('MASK_I18N_HMR_LINGUI', (e) => {
                const langs = (e as CustomEvent).detail
                addI18NBundleSingle(lingui, langs)
            })
        }
    } catch {
        // ignore
    }
    if (Array.isArray(langs)) langs.forEach((lang) => addI18NBundleSingle(lingui, lang))
    else addI18NBundleSingle(lingui, langs)
}
function addI18NBundleSingle(lingui: I18n, langs: LinguiI18NResource) {
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
export function createI18NBundle(langs: LinguiI18NResource[] | LinguiI18NResource) {
    return (lingui: I18n) => addI18NBundle(lingui, langs)
}
