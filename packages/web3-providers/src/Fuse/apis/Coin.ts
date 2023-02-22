import Fuse from 'fuse.js'
import type { FuseBaseAPI } from '../../types/Fuse.js'
import type { TrendingAPI } from '../../entry-types.js'

export class FuseCoinAPI implements FuseBaseAPI.Provider {
    create<T = TrendingAPI.Coin>(items: T[]) {
        return new Fuse(items, {
            keys: [
                { name: 'name', weight: 0.8 },
                { name: 'symbol', weight: 0.3 },
            ],
            isCaseSensitive: false,
            ignoreLocation: true,
            shouldSort: true,
            threshold: 0,
            minMatchCharLength: 3,
        })
    }
}
