import { useAsyncRetry } from 'react-use'
import { useAmmFactory } from '../contracts/useAmmFactory'
import { useSportsLinkMarketFactory } from '../contracts/useSportsLinkMarketFactory'
import type { AmmExchange, Market } from '../types'

export function useAmmExchange(market: Market | undefined) {
    const sportLinkMarekFactoryContract = useSportsLinkMarketFactory(market?.address ?? '')
    const ammMarekFactoryContract = useAmmFactory(market?.ammExchange?.address ?? '')

    return useAsyncRetry(async () => {
        if (!market || !ammMarekFactoryContract || !sportLinkMarekFactoryContract) return

        const balances = await ammMarekFactoryContract.methods.getPoolBalances(market.address, market.id).call()
        const weights = await ammMarekFactoryContract.methods.getPoolWeights(market.address, market.id).call()
        const shareFactor = await sportLinkMarekFactoryContract.methods.shareFactor().call()
        return { balances, weights, shareFactor } as AmmExchange
    }, [market])
}
