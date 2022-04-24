import { useSubscription } from 'use-subscription'
import { useWeb3State } from '../entry-web3'
import { UNDEIFNED } from '../utils/subscription'
import { NetworkPluginID, CurrencyType } from '../web3-types'

export function useTokenPrice<T extends NetworkPluginID>(pluginID: T, id: string, currencyType = CurrencyType.USD) {
    const { TokenPrice } = useWeb3State(pluginID)
    const prices = useSubscription(TokenPrice?.tokenPrices ?? UNDEIFNED)
    return prices?.[id]?.[currencyType]
}
