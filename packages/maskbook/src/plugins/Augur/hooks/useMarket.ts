import { formatAmount, formatBalance, useAugurConstants } from '@masknet/web3-shared'
import BigNumber from 'bignumber.js'
import { useAsyncRetry } from 'react-use'
import { FALLBACK_SWAP_FEE, SWAP_FEE_DECIMALS } from '../constants'
import { useAmmFactory } from '../contracts/useAmmFactory'
import { useMmaLinkMarketFactory } from '../contracts/useMmaLinkMarketFactory'
import { useSportsLinkMarketFactory } from '../contracts/useSportsLinkMarketFactory'
import { PluginAugurRPC } from '../messages'
import { Market, MarketType } from '../types'
import { getSport, getTeam } from '../utils'
import { deriveMmaMarketInfo } from '../utils/mmaMarket'
import { deriveSportMarketInfo } from '../utils/sportMarket'

export function useFetchMarket(address: string, id: string, link: string) {
    const { AMM_FACTORY_ADDRESS, GRAPH_URL } = useAugurConstants()
    const ammMarekFactoryContract = useAmmFactory(AMM_FACTORY_ADDRESS ?? '')
    const sportLinkMarekFactoryContract = useSportsLinkMarketFactory(address)
    const mmaMarekFactoryContract = useMmaLinkMarketFactory(address)

    return useAsyncRetry(async () => {
        if (!sportLinkMarekFactoryContract || !ammMarekFactoryContract || !mmaMarekFactoryContract || !GRAPH_URL) return

        let rawSwapFee
        try {
            rawSwapFee = await ammMarekFactoryContract.methods.getSwapFee(address, id).call()
        } catch {
            rawSwapFee = formatAmount(FALLBACK_SWAP_FEE / 100, SWAP_FEE_DECIMALS)
        }

        const swapFee = formatBalance(new BigNumber(rawSwapFee).multipliedBy(100).toFixed(2), SWAP_FEE_DECIMALS)
        const ammExchange = await PluginAugurRPC.fetchAmmExchange(address, id, GRAPH_URL)
        const marketInfo = await PluginAugurRPC.fetchMarketInfo(address, id, GRAPH_URL)

        if (!swapFee || !marketInfo) return

        if (marketInfo.teamSportsMarket && marketInfo.teamSportsMarket.length !== 0) {
            const teamSportsMarket = marketInfo.teamSportsMarket[0]
            const collateral = await sportLinkMarekFactoryContract.methods.collateral().call()
            const sportId = await sportLinkMarekFactoryContract.methods.sportId().call()
            const sport = getSport(sportId)
            const homeTeam = getTeam(teamSportsMarket.homeTeamId, sportId)
            const awayTeam = getTeam(teamSportsMarket.awayTeamId, sportId)
            const marketType = teamSportsMarket.marketType
            const score = teamSportsMarket.score
            const winner = teamSportsMarket.winner ?? ''
            const hasWinner = !!winner && !new BigNumber(winner).isZero()
            const endDate = new Date(Number.parseInt(teamSportsMarket.endTime, 10) * 1000)
            const [, shareTokens, , , , , ,] = await sportLinkMarekFactoryContract.methods.getMarket(id).call()

            const market = deriveSportMarketInfo(
                address,
                id,
                awayTeam,
                endDate,
                homeTeam,
                sport,
                marketType,
                shareTokens,
                score,
                winner,
                hasWinner,
            )
            return {
                ...market,
                marketType: MarketType.Sport,
                swapFee,
                collateral,
                link,
                ammExchange: { ...ammExchange, address: AMM_FACTORY_ADDRESS },
            } as Market
        } else if (marketInfo.mmaMarket && marketInfo.mmaMarket.length !== 0) {
            const mmaMarket = marketInfo.mmaMarket[0]
            const collateral = await mmaMarekFactoryContract.methods.collateral().call()
            const sportId = await mmaMarekFactoryContract.methods.sportId().call()
            const sport = getSport(sportId)
            const marketType = mmaMarket.marketType
            const winner = mmaMarket.winner ?? ''
            const hasWinner = !!winner && !new BigNumber(winner).isZero()
            const endDate = new Date(Number.parseInt(mmaMarket.endTime, 10) * 1000)
            const [, shareTokens, , , , , ,] = await mmaMarekFactoryContract.methods.getMarket(id).call()

            const market = deriveMmaMarketInfo(
                address,
                id,
                endDate,
                mmaMarket.awayFighterId,
                mmaMarket.awayFighterName,
                mmaMarket.homeFighterId,
                mmaMarket.homeFighterName,
                sport,
                marketType,
                shareTokens,
                winner,
                hasWinner,
            )
            return {
                ...market,
                marketType: MarketType.Mma,
                swapFee,
                collateral,
                link,
                ammExchange: { ...ammExchange, address: AMM_FACTORY_ADDRESS },
            } as Market
        } else if (marketInfo.cryptoMarket) {
        }
        return
    }, [address, id])
}
