import type { AugurAmmFactory } from '@masknet/web3-contracts/types/AugurAmmFactory'
import type { AugurMmaLinkMarketFactoryV2 } from '@masknet/web3-contracts/types/AugurMmaLinkMarketFactoryV2'
import type { AugurSportsLinkMarketFactoryV2 } from '@masknet/web3-contracts/types/AugurSportsLinkMarketFactoryV2'
import { formatAmount, formatBalance, useAugurConstants } from '@masknet/web3-shared'
import BigNumber from 'bignumber.js'
import { useAsyncRetry } from 'react-use'
import { FALLBACK_SWAP_FEE, SWAP_FEE_DECIMALS } from '../constants'
import { useAmmFactory } from '../contracts/useAmmFactory'
import { useMmaLinkMarketFactory } from '../contracts/useMmaLinkMarketFactory'
import { useSportsLinkMarketFactory } from '../contracts/useSportsLinkMarketFactory'
import { PluginAugurRPC } from '../messages'
import { BasicMarket, Market, MarketType, SportType } from '../types'
import { getSport, getTeam } from '../utils'
import { deriveMmaMarketInfo } from '../utils/mmaMarket'
import { deriveSportMarketInfo } from '../utils/sportMarket'

export function useFetchMarket(basicMarket: BasicMarket, cache: RequestCache = 'default') {
    const { address, id, ammAddress } = basicMarket
    const { GRAPH_URL } = useAugurConstants()
    const ammMarketFactoryContract = useAmmFactory(ammAddress)
    const sportLinkMarketFactoryContract = useSportsLinkMarketFactory(address)
    const mmaMarketFactoryContract = useMmaLinkMarketFactory(address)

    return useAsyncRetry(async () => {
        if (
            !sportLinkMarketFactoryContract ||
            !ammMarketFactoryContract ||
            !mmaMarketFactoryContract ||
            !GRAPH_URL ||
            !ammAddress
        )
            return
        return fetchMarket(
            basicMarket,
            ammMarketFactoryContract,
            sportLinkMarketFactoryContract,
            mmaMarketFactoryContract,
            GRAPH_URL,
            cache,
        )
    }, [address, id])
}

export async function fetchMarket(
    basicMarket: BasicMarket,
    // address: string,
    // id: string,
    // link: string,
    // ammAddress: string,
    ammMarketFactoryContract: AugurAmmFactory,
    sportLinkMarketFactoryContract: AugurSportsLinkMarketFactoryV2,
    mmaMarketFactoryContract: AugurMmaLinkMarketFactoryV2,
    GRAPH_URL: string,
    cache: RequestCache = 'default',
): Promise<Market | undefined> {
    const { address, id, link, ammAddress } = basicMarket

    let rawSwapFee
    try {
        rawSwapFee = await ammMarketFactoryContract.methods.getSwapFee(address, id).call()
    } catch {
        rawSwapFee = formatAmount(FALLBACK_SWAP_FEE / 100, SWAP_FEE_DECIMALS)
    }

    const swapFee = formatBalance(new BigNumber(rawSwapFee).multipliedBy(100).toFixed(2), SWAP_FEE_DECIMALS)
    const ammExchange = await PluginAugurRPC.fetchAmmExchange(address, id, GRAPH_URL, cache)
    const marketInfo = await PluginAugurRPC.fetchMarketInfo(address, id, GRAPH_URL)

    if (!swapFee || !marketInfo) return

    if (marketInfo.teamSportsMarket && marketInfo.teamSportsMarket.length !== 0) {
        const teamSportsMarket = marketInfo.teamSportsMarket[0]
        const collateral = await sportLinkMarketFactoryContract.methods.collateral().call()
        const sportId = (await sportLinkMarketFactoryContract.methods.sportId().call()) as SportType
        const sport = getSport(sportId)
        const homeTeam = getTeam(teamSportsMarket.homeTeamId, sportId)
        const awayTeam = getTeam(teamSportsMarket.awayTeamId, sportId)
        const marketType = teamSportsMarket.marketType
        const overUnderTotal = teamSportsMarket.overUnderTotal
        const winner = teamSportsMarket.winner ?? ''
        const hasWinner = !!winner && !new BigNumber(winner).isZero()
        const endDate = new Date(Number.parseInt(teamSportsMarket.endTime, 10) * 1000)
        const [, shareTokens, , , , , , , initialOdds] = await sportLinkMarketFactoryContract.methods
            .getMarket(id)
            .call()

        const market = deriveSportMarketInfo(
            address,
            id,
            awayTeam,
            endDate,
            homeTeam,
            sport,
            marketType,
            shareTokens,
            overUnderTotal,
            winner,
            hasWinner,
        )
        return {
            ...market,
            marketType: MarketType.Sport,
            initialOdds,
            swapFee,
            collateral,
            link,
            ammExchange,
            ammAddress,
        }
    } else if (marketInfo.mmaMarket && marketInfo.mmaMarket.length !== 0) {
        const mmaMarket = marketInfo.mmaMarket[0]
        const collateral = await mmaMarketFactoryContract.methods.collateral().call()
        const sportId = await mmaMarketFactoryContract.methods.sportId().call()
        const sport = getSport(sportId)
        const marketType = mmaMarket.marketType
        const winner = mmaMarket.winner ?? ''
        const hasWinner = !!winner && !new BigNumber(winner).isZero()
        const endDate = new Date(Number.parseInt(mmaMarket.endTime, 10) * 1000)
        const [, shareTokens, , , , , , , initialOdds] = await mmaMarketFactoryContract.methods.getMarket(id).call()

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
            initialOdds,
            swapFee,
            collateral,
            link,
            ammAddress,
            ammExchange,
        }
    } else if (marketInfo.cryptoMarket) {
        // Pending release from Augur
    }
    return
}
