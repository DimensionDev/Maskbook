import BigNumber from 'bignumber.js'
import { useAsyncRetry } from 'react-use'
import { useAmmFactory } from '../contracts/useAmmFactory'
import type { AmmOutcome, Market } from '../types'

export function useAmmOutcomes(market: Market | undefined) {
    const ammMarekFactoryContract = useAmmFactory(market?.ammExchange?.address ?? '')

    return useAsyncRetry(async () => {
        if (!ammMarekFactoryContract || !market) return
        if (market.hasWinner)
            return market.outcomes.map((o) => {
                return { ...o, rate: new BigNumber(o.isWinner ? 1 : 0) }
            })

        const shares = await ammMarekFactoryContract.methods.tokenRatios(market.address, market.id).call()
        if (shares.length === 0) {
            return market.outcomes.map((o) => {
                return { ...o, rate: new BigNumber(0) }
            })
        }

        const totalShares = shares.reduce(
            (accumulator: BigNumber, currentValue: string): BigNumber =>
                new BigNumber(accumulator).plus(new BigNumber(currentValue)),
            new BigNumber(0),
        )

        const ammOutcomes = shares.map((share: string, id: number) => {
            return { ...market.outcomes[id], rate: new BigNumber(share).dividedBy(totalShares) }
        })
        return ammOutcomes as AmmOutcome[]
    }, [market, ammMarekFactoryContract])
}
