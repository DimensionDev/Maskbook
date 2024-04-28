import urlcat from 'urlcat'
import type { ScalableBloomFilter } from 'bloom-filters'
import { fetchCachedJSON } from '../helpers/fetchJSON.js'
import type { ScamWarningAPI } from '../entry-types.js'
import { isNonNull } from '@masknet/kit'

const BASE_URL = 'https://scam.mask.r2d2.to/cryptoscam-db'

export class CryptoScamDB {
    private static bloomFilter?: ScalableBloomFilter

    static async getBloomFilter() {
        if (this.bloomFilter) return this.bloomFilter
        const filter = await fetchCachedJSON<JSON>(urlcat(BASE_URL, 'filter/config.json'))

        const { ScalableBloomFilter } = await import('bloom-filters')
        this.bloomFilter = ScalableBloomFilter.fromJSON(filter)
        return this.bloomFilter
    }

    static async getScamWarning(link: string): Promise<ScamWarningAPI.Info | undefined> {
        const filter = await this.getBloomFilter()
        if (!filter) return

        try {
            const url = new URL(link)
            if (!filter.has(url.host)) return

            const result = await fetchCachedJSON<ScamWarningAPI.Info>(urlcat(BASE_URL, `${url.host}.json`))
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

    static async getScamWarnings(links: string[]): Promise<ScamWarningAPI.Info[] | undefined> {
        const requests = links
            .map((x) => {
                if (x.startsWith('https://') || x.startsWith('http://')) return x
                return `http://${x}`
            })
            .map((x) => this.getScamWarning(x))
        const result = await Promise.allSettled(requests)
        return result
            .filter((x) => x.status === 'fulfilled')
            .map((x) => x.value)
            .filter(isNonNull)
    }
}
