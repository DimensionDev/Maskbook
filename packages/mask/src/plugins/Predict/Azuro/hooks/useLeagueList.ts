import type { AzuroGame } from '@azuro-protocol/sdk'
import { uniqBy } from 'lodash-unified'
import { useMemo } from 'react'

export function useLeagueList(games: AzuroGame[] | undefined) {
    const leagues = useMemo(() => {
        return games?.map((game) => {
            return {
                id: game.league,
                label: `${game.country}: ${game.league}`,
            }
        })
    }, [games])

    return uniqBy(leagues, 'id').sort((a, b) => a.id.localeCompare(b.id))
}
