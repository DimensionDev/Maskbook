import Fuse from 'fuse.js'
import type { FuseAPI } from '../types/Fuse.js'
import type { TrendingAPI } from '../types/Trending.js'

export class FuseTrendingAPI implements FuseAPI.Provider<TrendingAPI.Coin> {
    private searchableItems: Fuse<TrendingAPI.Coin> | null = null

    async getSearchableItems(getCoins: () => Promise<TrendingAPI.Coin[]>) {
        if (!this.searchableItems) {
            const items = await getCoins()
            this.searchableItems = new Fuse(items, {
                keys: [
                    { name: 'name', weight: 0.5 },
                    { name: 'symbol', weight: 0.8 },
                ],
                isCaseSensitive: false,
                ignoreLocation: true,
                shouldSort: true,
                threshold: 0.45,
                minMatchCharLength: 3,
            })
        }
        return this.searchableItems
    }
}
