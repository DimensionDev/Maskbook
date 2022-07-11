import { throttle } from 'lodash-unified'
import list from './i18n-cache-query-list'

export type Bundle = [namespace: string, lang: string, json: object]
export async function queryRemoteI18NBundle(lang: string): Promise<Bundle[]> {
    // skip fetching in development. if you need to debug this, please comment this code.
    if (process.env.NODE_ENV === 'development') return []

    const updateLang = getCurrentLanguage(lang)
    if (!updateLang) return []

    const timestamp = await fetchManifest()

    const storage = await caches.open('i18n')
    const results = await Promise.allSettled(
        Object.entries(list).map(async ([url, namespace]): Promise<[object | null, string]> => {
            url =
                'https://distributions.crowdin.net/c4267b19b900d4c0b67f018ulde/content' +
                url.replace('%locale%', updateLang)

            // for each URL, we query the cache storage
            const res: Response | undefined = await storage.match(url)
            const lastModified = res?.headers.get('Last-Modified')
            if (lastModified) {
                const lastModifiedDate = new Date(lastModified)

                // if it is newer than the timestamp, we don't need to fetch it again
                if (lastModifiedDate >= new Date(timestamp * 1000)) {
                    if (res?.ok) return [await res.json(), namespace]
                    // it failed, we'll not retry it until lastModified outdated.
                    else return [null, namespace]
                }
            }

            // fill the cache storage
            const res2 = await fetch(url, fetchOption)
            if (res2.ok) storage.put(url, res2.clone())
            else {
                const failed = new Response(null, {
                    headers: new Headers({
                        ...res2.headers,
                        'Last-Modified': new Date(timestamp * 1000).toUTCString(),
                    }),
                    status: res2.status,
                })
                storage.put(url, failed)
            }

            if (res2.ok) return [await res2.json(), namespace]
            return [null, namespace]
        }),
    )

    const bundle: Bundle[] = []
    for (const result of results) {
        if (result.status === 'rejected') continue
        const [json, namespace] = result.value
        if (!json || !namespace) continue
        bundle.push([namespace, updateLang, json])
    }

    return bundle
}

const fetchOption = {
    credentials: 'omit',
    referrerPolicy: 'no-referrer',
} as const

const fetchManifest = throttle(async () => {
    const { timestamp } = await fetch(
        'https://distributions.crowdin.net/c4267b19b900d4c0b67f018ulde/manifest.json',
        fetchOption,
    ).then((x) => x.json())
    return timestamp
}, 1000 * 60)

function getCurrentLanguage(lang: string) {
    // en-US is not hosted on crowdin
    if (lang === 'en-US') return null
    if (['zh-CN', 'zh-TW'].includes(lang)) return lang
    if (lang.startsWith('zh')) return 'zh-TW'
    if (lang.startsWith('ja')) return 'ja-JP'
    if (lang.startsWith('ko')) return 'ko-KR'
    return null
}
