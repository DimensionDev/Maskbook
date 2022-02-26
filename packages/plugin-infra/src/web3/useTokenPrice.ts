import { NetworkPluginID, CurrencyType } from '../web3-types'
import { usePluginWeb3StateContext } from './Context'

export function useTokenPrice(pluginID: NetworkPluginID, id: string, currencyType = CurrencyType.USD) {
    const { tokenPrices } = usePluginWeb3StateContext(pluginID) ?? {}
    return tokenPrices?.[id][currencyType] ?? 0
}
