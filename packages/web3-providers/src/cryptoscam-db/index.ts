import type { ScamWarningAPI } from '../types/ScamWarning.js'
import urlcat from 'urlcat'
import { fetchJSON } from '../helpers.js'
import { ScalableBloomFilter } from 'bloom-filters'

export interface OnlineInfo {
    name: string
    url: string
    path?: string
    category?: number
    subcategory?: number
    description: string
}

const baseURL = 'https://raw.githubusercontent.com/DimensionDev/Mask-Scam-List/main/providers/cryptoscam-db/'

export class CryptoScamDBAPI implements ScamWarningAPI.Provider {
    bloomFilter?: ScalableBloomFilter

    async getBloomFilter() {
        if (this.bloomFilter) return this.bloomFilter
        const filter = await fetchJSON<JSON>(urlcat(baseURL, 'filter/config.json'))

        this.bloomFilter = ScalableBloomFilter.fromJSON(filter)
        return this.bloomFilter as ScalableBloomFilter
    }

    async getScamWarning(key: string): Promise<ScamWarningAPI.Info | undefined> {
        const filter = await this.getBloomFilter()
        if (!filter) return

        if (!filter.has(key)) return

        return fetchJSON<ScamWarningAPI.Info>(urlcat(baseURL, `${key}.json`))
    }

    async getScamWarnings(keys: string[]): Promise<ScamWarningAPI.Info[] | undefined> {
        const requests = keys.map((x) => this.getScamWarning(x))
        const result = await Promise.allSettled(requests)
        return result
            .map((x) => (x.status === 'fulfilled' ? x.value : undefined))
            .filter((x): x is ScamWarningAPI.Info => !!x)
    }
}
