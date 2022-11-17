import type { ScamWarningAPI } from '../types/ScamWarning.js'
import urlcat from 'urlcat'
import { fetchJSON } from '../helpers.js'
import { ScalableBloomFilter } from 'bloom-filters'

const baseURL = 'https://raw.githubusercontent.com/DimensionDev/Mask-Scam-List/main/providers/cryptoscam-db/'

export class CryptoScamDBAPI implements ScamWarningAPI.Provider {
    bloomFilter?: ScalableBloomFilter

    async getBloomFilter() {
        if (this.bloomFilter) return this.bloomFilter
        const filter = await fetchJSON<JSON>(urlcat(baseURL, 'filter/config.json'))

        this.bloomFilter = ScalableBloomFilter.fromJSON(filter)
        return this.bloomFilter as ScalableBloomFilter
    }

    async getScamWarning(link: string): Promise<ScamWarningAPI.Info | undefined> {
        const filter = await this.getBloomFilter()
        if (!filter) return

        try {
            const url = new URL(link)
            if (!filter.has(url.host)) return

            const result = await fetchJSON<ScamWarningAPI.Info>(urlcat(baseURL, `${url.host}.json`))
            if (!result) return

            if (!url.pathname || url.pathname === '/') return result

            const scamURL = new URL(result.url)
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
