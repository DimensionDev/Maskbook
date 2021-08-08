import { useAugurConstants } from '@masknet/web3-shared'
import { useAsyncRetry } from 'react-use'
import { useAmmFactory } from '../contracts/useAmmFactory'
import { useSportsLinkMarketFactory } from '../contracts/useSportsLinkMarketFactory'
import type { AmmExchange } from '../types'

export function useAmmExchange(address: string, id: string) {
    const sportLinkMarekFactoryContract = useSportsLinkMarketFactory(address)
    const { AMM_FACTORY_ADDRESS } = useAugurConstants()
    const ammMarekFactoryContract = useAmmFactory(AMM_FACTORY_ADDRESS ?? '')

    return useAsyncRetry(async () => {
        if (!ammMarekFactoryContract || !sportLinkMarekFactoryContract) return

        const balances = await ammMarekFactoryContract.methods.getPoolBalances(address, id).call()
        const weights = await ammMarekFactoryContract.methods.getPoolWeights(address, id).call()
        const shareFactor = await sportLinkMarekFactoryContract.methods.shareFactor().call()
        return { balances, weights, shareFactor } as AmmExchange
    }, [address, id])
}
