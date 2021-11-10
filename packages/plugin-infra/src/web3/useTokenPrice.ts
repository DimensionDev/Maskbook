import type { CurrencyType } from '../types'
import { usePluginWeb3StateContext } from '../context'

export function useTokenPrice(id: string, currencyType: string, pluginID?: string) {
    const { prices } = usePluginWeb3StateContext(pluginID) ?? {}
    return prices?.[id][currencyType as CurrencyType] ?? 0
}
