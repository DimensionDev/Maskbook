import type { AzuroGame } from '@azuro-protocol/sdk'
import { uniqBy } from 'lodash-unified'
import { marketRegistry } from '../helpers'

export function useMarketList(games: AzuroGame[] | undefined) {
    const markets = games?.map((game) => ({ id: game.marketRegistryId, label: marketRegistry[game.marketRegistryId] }))

    return uniqBy(markets, 'id')
        .concat({ id: 0, label: 'All' })
        .sort((a, b) => a.label.localeCompare(b.label))
}
