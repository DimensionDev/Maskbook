import { r2d2CorsURL, r2d2URL, R2d2Workers } from '@masknet/shared-base'

/**
 * Why use r2d2 fetch: some third api provider will be block in Firefox and protect api key
 * @returns fetch response
 * @param url
 * @param init
 * @param r2deWorkerType
 */
export async function r2d2Fetch(url: string, init?: RequestInit, r2deWorkerType?: R2d2Workers): Promise<Response> {
    if (!r2deWorkerType) {
        const result = await globalThis.fetch(url, init)
        if (result.ok) return result
    }

    const origin = new URL(url).origin
    const r2d2ProxyURL = url.replace(origin, `https://${r2deWorkerType}.${r2d2URL}`)
    const requestURL = r2deWorkerType ? r2d2ProxyURL : `https://${url}.${r2d2CorsURL}`

    return globalThis.fetch(requestURL, init)
}
