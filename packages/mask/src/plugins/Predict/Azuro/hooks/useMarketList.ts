// import type { Events } from '../types'

import { uniqBy, flattenDeep } from 'lodash-unified'
import { marketRegistry } from '../helpers/index.js'
import type { Event } from '../types.js'

export function useMarketList(events: Event[] | undefined) {
    const markets = events?.map((event) => ({
        id: event.marketRegistryId,
        label: marketRegistry[event.marketRegistryId],
    }))

    const marketsFlatten: Array<{ id: number; label: string }> | undefined = flattenDeep(markets)

    return uniqBy(marketsFlatten, 'id')
        .concat({ id: 0, label: 'All' })
        .sort((a, b) => a.label.localeCompare(b.label))
}
