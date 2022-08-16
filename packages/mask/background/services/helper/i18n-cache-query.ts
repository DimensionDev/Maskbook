import { Flags } from '../../../shared/flags'
import list from './i18n-cache-query-list'

export type Bundle = [namespace: string, lang: string, json: object]
export async function queryRemoteI18NBundle(lang: string): Promise<Bundle[]> {
    if (!Flags.i18nTranslationHotUpdate) return []
    // skip fetching in development. if you need to debug this, please comment this code.
    if (process.env.NODE_ENV === 'development') return []

    const updateLang = getCurrentLanguage(lang)
    if (!updateLang) return []

    const responses = updateLang === 'en-US' ? fetchEnglishBundle() : fetchTranslatedBundle(lang)
    const results = await Promise.allSettled(responses)
    return results.filter((x): x is PromiseFulfilledResult<Bundle> => x.status === 'fulfilled').map((x) => x.value)
}

function fetchTranslatedBundle(lang: string) {
    return Object.entries(list).map(async ([url, namespace]): Promise<Bundle> => {
        const path = url.replace('%locale%', lang)
        const response = await fetch(
            'https://distributions.crowdin.net/c4267b19b900d4c0b67f018ulde/content' + path,
            fetchOption,
        )
        return [namespace, lang, await response.json()]
    })
}
function fetchEnglishBundle() {
    return Object.entries(list).map(async ([url, namespace]): Promise<Bundle> => {
        const path = url.replace('/[DimensionDev.Maskbook] ', '').replace('%locale%', 'en-US')
        const response = await fetch('https://raw.githubusercontent.com/DimensionDev/Maskbook/' + path, fetchOption)
        return [namespace, 'en-US', await response.json()]
    })
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
