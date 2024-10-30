import list from './i18n-cache-query-list.js'

export type Bundle = [namespace: string, lang: string, json: Record<string, string>]
export async function queryRemoteI18NBundle(lang: string): Promise<Bundle[]> {
    // skip fetching in development. if you need to debug this, please comment this code.
    if (process.env.NODE_ENV === 'development') return []

    const updateLang = getCurrentLanguage(lang)
    if (!updateLang) return []

    const responses = updateLang === 'en-US' ? fetchEnglishBundle() : fetchTranslatedBundle(lang)
    const results = await Promise.allSettled(responses)
    return results
        .filter((x) => x.status === 'fulfilled')
        .map((x) => x.value!)
        .filter(Boolean)
}

const I18N_LOCALES_HOST = 'https://maskbook.pages.dev/'

function fetchTranslatedBundle(lang: string) {
    return Object.entries(list as Record<string, string>).map(async ([url, namespace]): Promise<Bundle | null> => {
        try {
            const path = url.replace('%locale%', lang)
            const response = await fetch(I18N_LOCALES_HOST + path, fetchOption)
            const json = await response.json()
            if (!isValidTranslation(json)) return null
            return [namespace, lang, json]
        } catch {
            return null
        }
    })
}
function fetchEnglishBundle() {
    return Object.entries(list as Record<string, string>).map(async ([url, namespace]): Promise<Bundle | null> => {
        try {
            const path = url.replace('%locale%', 'en-US')
            const response = await fetch(I18N_LOCALES_HOST + path, fetchOption)
            const json = await response.json()
            if (!isValidTranslation(json)) return null
            return [namespace, 'en-US', json]
        } catch {
            return null
        }
    })
}
function isValidTranslation(obj: unknown): obj is Record<string, string> {
    if (typeof obj !== 'object' || obj === null) return false
    for (const key in obj) {
        if (typeof (obj as any)[key] !== 'string') return false
    }
    return true
}

const fetchOption = {
    credentials: 'omit',
    referrerPolicy: 'no-referrer',
} as const

function getCurrentLanguage(lang: string) {
    if (['zh-CN', 'zh-TW'].includes(lang)) return lang
    if (lang.startsWith('en')) return 'en-US'
    if (lang.startsWith('zh')) return 'zh-TW'
    if (lang.startsWith('ja')) return 'ja-JP'
    if (lang.startsWith('ko')) return 'ko-KR'
    return null
}
