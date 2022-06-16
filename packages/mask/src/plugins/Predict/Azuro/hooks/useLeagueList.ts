import type { AzuroGame } from '@azuro-protocol/sdk'
import { uniqBy } from 'lodash-unified'

export function useLeagueList(games: AzuroGame[] | undefined) {
    const leagues = games?.map((game) => {
        return {
            id: game.league,
            label: `${game.country}: ${game.league}`,
        }
    })

    return uniqBy(leagues, 'id').sort((a, b) => a.id.localeCompare(b.id))
}
