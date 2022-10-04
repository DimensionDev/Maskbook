import { uniqWith, isEqual } from 'lodash-unified'
import type { Event } from '../types.js'

export function useLeagueList(events: Event[] | undefined) {
    const leagues = events?.map((event) => ({
        id: event.leagueId,
        label: `${event.titleCountry}: ${event.titleLeague}`,
    }))

    const leaguesUnique = uniqWith(leagues, isEqual)

    return leaguesUnique?.concat([{ id: 0, label: 'All' }]).sort((a, b) => a.label.localeCompare(b.label))
}
