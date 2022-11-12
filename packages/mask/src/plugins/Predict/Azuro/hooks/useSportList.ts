import { uniqBy } from 'lodash-unified'
import { useMemo } from 'react'
import { sportRegistry } from '../helpers'
import type { Event } from '../types.js'

export function useSportList(games: Event[] | undefined) {
    const markets = useMemo(() => {
        const markets = games?.map((game) => ({ id: game.sportTypeId, label: sportRegistry[game.sportTypeId] }))
        return uniqBy(markets, 'id')
            .concat({ id: 0, label: 'All' })
            .sort((a, b) => a.label.localeCompare(b.label))
    }, [games])

    return markets
}
