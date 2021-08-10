import { formatAmount, formatBalance, useAugurConstants } from '@masknet/web3-shared'
import BigNumber from 'bignumber.js'
import { useAsyncRetry } from 'react-use'
import { FALLBACK_SWAP_FEE, SWAP_FEE_DECIMALS } from '../constants'
import { useAmmFactory } from '../contracts/useAmmFactory'
import { useSportsLinkMarketFactory } from '../contracts/useSportsLinkMarketFactory'
import { PluginAugurRPC } from '../messages'
import type { Market } from '../types'
import { deriveSportMarketInfo, getSport, getTeam } from '../utils'

export function useFetchMarket(address: string, id: string, link: string) {
    const sportLinkMarekFactoryContract = useSportsLinkMarketFactory(address)
    const { AMM_FACTORY_ADDRESS, GRAPH_URL } = useAugurConstants()
    const ammMarekFactoryContract = useAmmFactory(AMM_FACTORY_ADDRESS ?? '')

    return useAsyncRetry(async () => {
        if (!sportLinkMarekFactoryContract || !ammMarekFactoryContract || !GRAPH_URL) return

        const collateral = await sportLinkMarekFactoryContract.methods.collateral().call()

        let rawSwapFee
        try {
            rawSwapFee = await ammMarekFactoryContract.methods.getSwapFee(address, id).call()
        } catch {
            rawSwapFee = formatAmount(FALLBACK_SWAP_FEE / 100, SWAP_FEE_DECIMALS)
        }

        const ammExchange = await PluginAugurRPC.fetchAmmExchange(address, id, GRAPH_URL)
        const [, shareTokens, rawEndDate, winner, , , ,] = await sportLinkMarekFactoryContract.methods
            .getMarket(id)
            .call()
        const [, homeTeamId, awayTeamId, , sportsMarketType, , value0] = await sportLinkMarekFactoryContract.methods
            .getMarketDetails(id)
            .call()

        const swapFee = formatBalance(new BigNumber(rawSwapFee).multipliedBy(100).toFixed(2), SWAP_FEE_DECIMALS)
        const homeTeam = getTeam(homeTeamId)
        const awayTeam = getTeam(awayTeamId)
        const sport = getSport(homeTeam.sportId)
        const hasWinner = !new BigNumber(winner).isZero()
        const endDate = new Date(Number.parseInt(rawEndDate, 10) * 1000)

        const market = deriveSportMarketInfo(
            address,
            id,
            awayTeam,
            endDate,
            homeTeam,
            sport,
            sportsMarketType,
            shareTokens,
            value0,
            winner,
            hasWinner,
        )
        return {
            ...market,
            collateral,
            swapFee,
            link,
            ammExchange: { ...ammExchange, address: AMM_FACTORY_ADDRESS },
        } as Market
    }, [address, id])
}
