import { useChainId } from '@masknet/plugin-infra/web3'
import { NetworkPluginID } from '@masknet/web3-shared-base'
import { flattenDeep } from 'lodash-unified'
import { useAsyncRetry } from 'react-use'
import { fetchGames, fetchGamesByIds, fetchOddsByConditions } from '../api/index.js'
import type { EventsFormatted, RawEvents, Event } from '../types.js'

export function useFetchApi(_searchTerm: string, _market: number, _league: number, _sort: string) {
    const chainId = useChainId(NetworkPluginID.PLUGIN_EVM)

    return useAsyncRetry(async () => {
        if (!chainId) return

        const rawEvents = await fetchGames()

        const eventsFormatted = eventsAdapter(rawEvents)

        const games = await fetchGamesByIds(extractUniqueGamesIds(eventsFormatted))
        console.log('games: ', games)

        const odds = await fetchOddsByConditions(extractConditionsIds(eventsFormatted))
        const events: Event[] = eventsFormatted.map((event) => {
            const { opponents, ...rest } = games[event.gameId]

            return {
                ...event,
                ...rest,
                participants: opponents.map((opponent) => ({
                    name: opponent.title,
                    image: opponent.image,
                })),
                conditions: event.conditions.map((condition) => {
                    const _odds = Object.values(odds[condition.id])

                    return { ...condition, odds: _odds }
                }),
            }
        })

        const eventsMarketsFilter = _market ? events.filter((event) => event.marketRegistryId === _market) : events
        const eventsLeaguesFilter = _league
            ? eventsMarketsFilter.filter((event) => event.leagueId === _league)
            : eventsMarketsFilter
        const eventsTermFilter = _searchTerm
            ? eventsLeaguesFilter.filter((event) =>
                  event.participants.some((participant) =>
                      participant.name.toLowerCase().includes(_searchTerm.toLowerCase()),
                  ),
              )
            : eventsLeaguesFilter

        if (_sort !== 'Default') {
            _sort === 'Start Date'
                ? eventsTermFilter.sort((a, b) => a.startDate - b.startDate)
                : eventsTermFilter.sort((a, b) => b.startDate - a.startDate)
        }

        return { events, eventsFiltered: eventsTermFilter }
    }, [_searchTerm, _market, _league, _sort])
}

function extractUniqueGamesIds(events: EventsFormatted[]): number[] {
    return events.map((event) => event.gameId).filter((event, index, self) => self.indexOf(event) === index)
}

function extractConditionsIds(events: EventsFormatted[]): number[] {
    return events.map((event) => event.conditions.map((condition) => condition.id)).flat()
}

function eventsAdapter(rawEvents: RawEvents[]): EventsFormatted[] {
    const eventsFormatted = rawEvents.map((event) =>
        event.countryLeagues.map((league) =>
            league.games.map((game) =>
                game.conditionsByMarket.map((market) => ({
                    gameId: game.gameId,
                    conditions: market.conditions,
                    marketRegistryId: market.marketRegistryId,
                })),
            ),
        ),
    )

    return flattenDeep(eventsFormatted)
}
