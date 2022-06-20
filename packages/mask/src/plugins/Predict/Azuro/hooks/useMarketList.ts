import type { AzuroGame } from '@azuro-protocol/sdk'
import { uniqBy } from 'lodash-unified'
import { useMemo } from 'react'
import { marketRegistry } from '../helpers'

export function useMarketList(games: AzuroGame[] | undefined) {
    const markets = useMemo(() => {
        return games?.map((game) => ({ id: game.marketRegistryId, label: marketRegistry[game.marketRegistryId] }))
    }, [games])

    return uniqBy(markets, 'id')
        .concat({ id: 0, label: 'All' })
        .sort((a, b) => a.label.localeCompare(b.label))
}
