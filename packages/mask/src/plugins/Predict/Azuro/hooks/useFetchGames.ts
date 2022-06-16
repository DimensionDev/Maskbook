import { useChainId } from '@masknet/plugin-infra/web3'
import type { ChainId } from '@masknet/web3-shared-evm'
import { useAsyncRetry } from 'react-use'
import { fetchEvents } from '../api'

export function useFetchGames(searchTerm: string, market: number, league: string, sort: string) {
    const chainId = useChainId()

    return useAsyncRetry(async () => {
        const games = await fetchEvents(chainId as ChainId)

        let gamesWithFilters = games.filter((game) =>
            game.participants.some((participant) => participant.name.toLowerCase().includes(searchTerm.toLowerCase())),
        )

        if (market !== 0) {
            gamesWithFilters = gamesWithFilters.filter((game) => game.marketRegistryId === market)
        }

        if (league !== 'Default') {
            gamesWithFilters = gamesWithFilters.filter((game) => game.league === league)
        }

        if (sort !== 'Default') {
            sort === 'Start Date'
                ? gamesWithFilters.sort((a, b) => a.startsAt - b.startsAt)
                : gamesWithFilters.sort((a, b) => b.startsAt - a.startsAt)
        }

        return { games, gamesWithFilters }
    }, [searchTerm, market, league, sort, chainId])
}
