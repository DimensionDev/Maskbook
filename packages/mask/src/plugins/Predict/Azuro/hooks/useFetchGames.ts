import { useChainId } from '@masknet/plugin-infra/web3'
import { NetworkPluginID } from '@masknet/web3-shared-base'
import { useAsyncRetry } from 'react-use'
import { PluginPredictRPC } from '../../messages'

export function useFetchGames(searchTerm: string, market: number, league: string, sort: string) {
    const chainId = useChainId(NetworkPluginID.PLUGIN_EVM)

    return useAsyncRetry(async () => {
        const games = await PluginPredictRPC.fetchEvents(chainId)
        console.log(games)

        const gamesFiltered = games.filter((game) => {
            if (market !== 0) return game.marketRegistryId === market
            if (league !== 'Default') return game.league === league

            return game.participants.some((participant) =>
                participant.name.toLowerCase().includes(searchTerm.toLowerCase()),
            )
        })

        if (sort !== 'Default') {
            sort === 'Start Date'
                ? gamesFiltered.sort((a, b) => a.startsAt - b.startsAt)
                : gamesFiltered.sort((a, b) => b.startsAt - a.startsAt)
        }

        return { games, gamesFiltered }
    }, [searchTerm, market, league, sort, chainId])
}
