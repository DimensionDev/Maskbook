import { formatBalance, useAugurConstants } from '@masknet/web3-shared'
import BigNumber from 'bignumber.js'
import { useAsyncRetry } from 'react-use'
import { SWAP_FEE_DECIMALS } from '../constants'
import { useAMMFactory } from '../contracts/useAMMFactory'
import { useSportsLinkMarketFactory } from '../contracts/useSportsLinkMarketFactory'
import type { Market } from '../types'
import { deriveSportMarketInfo, getSport, getTeam } from '../utils'

export function useFetchMarket(address: string, id: string, link: string) {
    const sportLinkMarekFactoryContract = useSportsLinkMarketFactory(address)
    const { AMM_FACTORY_ADDRESS } = useAugurConstants()
    const ammMarekFactoryContract = useAMMFactory(AMM_FACTORY_ADDRESS)

    return useAsyncRetry(async () => {
        if (!sportLinkMarekFactoryContract || !ammMarekFactoryContract) return

        const collateral = await sportLinkMarekFactoryContract.methods.collateral().call()
        const rawSwapFee = await ammMarekFactoryContract.methods.getSwapFee(address, id).call()
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
        return { ...market, collateral, swapFee, link } as Market
    }, [address, id])
}
