import { useAsyncRetry } from 'react-use'
import { useSportsLinkMarketFactory } from '../contracts/useSportsLinkMarketFactory'
import { deriveSportMarketInfo, getSport, getTeam } from '../utils'

export function useFetchMarket(address: string, id: string, link: string) {
    const sportLinkMarekFactoryContract = useSportsLinkMarketFactory(address)

    return useAsyncRetry(async () => {
        if (!sportLinkMarekFactoryContract) return
        const [, shareTokens, endDate, winner, , , ,] = await sportLinkMarekFactoryContract.methods.getMarket(id).call()
        const [, homeTeamId, awayTeamId, , sportsMarketType, , value0] = await sportLinkMarekFactoryContract.methods
            .getMarketDetails(id)
            .call()

        const homeTeam = getTeam(homeTeamId)
        const awayTeam = getTeam(awayTeamId)
        const sport = getSport(homeTeam.sportId)

        const market = deriveSportMarketInfo(
            address,
            id,
            link,
            awayTeam,
            new Date(Number.parseInt(endDate, 10) * 1000),
            homeTeam,
            sport,
            sportsMarketType,
            shareTokens,
            value0,
            winner,
            !!winner,
        )
        console.log(market)
        return market
    }, [address, id])
}
