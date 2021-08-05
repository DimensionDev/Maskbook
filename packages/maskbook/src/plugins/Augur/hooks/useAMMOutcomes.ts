import { useAugurConstants } from '@masknet/web3-shared'
import BigNumber from 'bignumber.js'
import { useAsyncRetry } from 'react-use'
import { useAMMFactory } from '../contracts/useAMMFactory'
import type { AMMOutcome, Market } from '../types'

export function useAMMOutcomes(address: string, id: string, market: Market | undefined) {
    const { AMM_FACTORY_ADDRESS } = useAugurConstants()
    const ammMarekFactoryContract = useAMMFactory(AMM_FACTORY_ADDRESS)

    return useAsyncRetry(async () => {
        if (!ammMarekFactoryContract || !market) return
        if (market.hasWinner)
            return market.outcomes.map((o) => {
                return { ...o, rate: new BigNumber(o.isWinner ? 1 : 0) }
            })

        const shares = await ammMarekFactoryContract.methods.tokenRatios(address, id).call()
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
        return ammOutcomes as AMMOutcome[]
    }, [address, id, ammMarekFactoryContract, market])
}
