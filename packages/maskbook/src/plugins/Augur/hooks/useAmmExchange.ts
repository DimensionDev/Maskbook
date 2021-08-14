import { useAsyncRetry } from 'react-use'
import { useAmmFactory } from '../contracts/useAmmFactory'
import { useMmaLinkMarketFactory } from '../contracts/useMmaLinkMarketFactory'
import { useSportsLinkMarketFactory } from '../contracts/useSportsLinkMarketFactory'
import { AmmExchange, Market, MarketType } from '../types'

export function useAmmExchange(market: Market | undefined) {
    const ammMarekFactoryContract = useAmmFactory(market?.ammExchange?.address ?? '')
    const sportLinkMarekFactoryContract = useSportsLinkMarketFactory(market?.address ?? '')
    const mmaMarekFactoryContract = useMmaLinkMarketFactory(market?.address ?? '')

    return useAsyncRetry(async () => {
        if (
            !market ||
            !market.ammExchange ||
            !ammMarekFactoryContract ||
            !sportLinkMarekFactoryContract ||
            !mmaMarekFactoryContract
        )
            return

        const balances = await ammMarekFactoryContract.methods.getPoolBalances(market.address, market.id).call()
        const weights = await ammMarekFactoryContract.methods.getPoolWeights(market.address, market.id).call()

        let shareFactor
        if (market.marketType === MarketType.Sport) {
            shareFactor = await sportLinkMarekFactoryContract.methods.shareFactor().call()
        } else if (market.marketType === MarketType.Mma) {
            shareFactor = await mmaMarekFactoryContract.methods.shareFactor().call()
        } else if (market.marketType === MarketType.Crypto) {
            // TODO: when augur deployed any crypto market
        }
        market.dirtyAmmExchnage = false
        return { address: market.ammExchange.address, balances, weights, shareFactor } as AmmExchange
    }, [market, market?.dirtyAmmExchnage])
}
