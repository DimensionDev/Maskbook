import { useAugurConstants } from '@masknet/web3-shared'
import { useAsyncRetry } from 'react-use'
import { useAmmFactory } from '../contracts/useAmmFactory'
import { useMmaLinkMarketFactory } from '../contracts/useMmaLinkMarketFactory'
import { useSportsLinkMarketFactory } from '../contracts/useSportsLinkMarketFactory'
import { PluginAugurRPC } from '../messages'
import { AmmExchange, Market, MarketType } from '../types'

export function useAmmExchange(market: Market | undefined) {
    const ammMarekFactoryContract = useAmmFactory(market?.ammExchange?.address ?? '')
    const sportLinkMarekFactoryContract = useSportsLinkMarketFactory(market?.address ?? '')
    const mmaMarekFactoryContract = useMmaLinkMarketFactory(market?.address ?? '')
    const { GRAPH_URL } = useAugurConstants()

    return useAsyncRetry(async () => {
        if (
            !market ||
            !market.ammExchange ||
            !ammMarekFactoryContract ||
            !sportLinkMarekFactoryContract ||
            !mmaMarekFactoryContract ||
            !GRAPH_URL
        )
            return

        const ammExchange = await PluginAugurRPC.fetchAmmExchange(market.address, market.id, GRAPH_URL)
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
        return { ...ammExchange, address: market.ammExchange.address, balances, weights, shareFactor } as AmmExchange
    }, [market, market?.dirtyAmmExchnage])
}
