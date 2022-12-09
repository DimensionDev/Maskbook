import urlcat from 'urlcat'
import type { ScalableBloomFilter } from 'bloom-filters'
import type { ScamWarningAPI } from '../types/ScamWarning.js'
import { fetchJSON } from '../entry-helpers.js'

const baseURL = 'https://scam.mask.r2d2.to/cryptoscam-db'

export class CryptoScamDBAPI implements ScamWarningAPI.Provider {
    bloomFilter?: Promise<ScalableBloomFilter>

    getBloomFilter() {
        if (this.bloomFilter) return this.bloomFilter
        const promise = (async () => {
            const filter = await fetchJSON(urlcat(baseURL, 'filter/config.json'))
            const { ScalableBloomFilter } = await import('bloom-filters')
            return ScalableBloomFilter.fromJSON(filter as any)
        })()
        this.bloomFilter = promise
        return promise
    }

    async getScamWarning(link: string): Promise<ScamWarningAPI.Info | undefined> {
        const filter = await this.getBloomFilter()
        if (!filter) return

        try {
            const url = new URL(link)
            if (!filter.has(url.host)) return

            const result = await fetchJSON<ScamWarningAPI.Info>(urlcat(baseURL, `${url.host}.json`))
            if (!result) return

            const scamURL = new URL(result.url)

            if ((!url.pathname || url.pathname === '/') && (!scamURL.pathname || scamURL.pathname === '/'))
                return result

            if (
                url.pathname.toLowerCase() === scamURL.pathname.toLowerCase() &&
                url.search.toLowerCase() === scamURL.search.toLowerCase()
            ) {
                return result
            }

            return
        } catch {
            return
        }
    }

    async getScamWarnings(links: string[]): Promise<ScamWarningAPI.Info[] | undefined> {
        const requests = links
            .map((x) => {
                if (x.startsWith('https://') || x.startsWith('http://')) return x
                return `http://${x}`
            })
            .map((x) => this.getScamWarning(x))
        const result = await Promise.allSettled(requests)
        return result
            .map((x) => (x.status === 'fulfilled' ? x.value : undefined))
            .filter((x): x is ScamWarningAPI.Info => !!x)
    }
}
