import type { NetworkPluginID } from '..'
import type { CurrencyType } from '../web3-types'
import { usePluginWeb3StateContext } from './Context'

export function useTokenPrice(id: string, currencyType: string, pluginID?: NetworkPluginID) {
    const { prices } = usePluginWeb3StateContext(pluginID) ?? {}
    return prices?.[id][currencyType as CurrencyType] ?? 0
}
