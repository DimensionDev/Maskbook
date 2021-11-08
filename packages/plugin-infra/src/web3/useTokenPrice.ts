import type { Plugin } from '..'
import { usePluginWeb3StateContext } from '../context'

export function useTokenPrice(id: string, currencyType: string) {
    const { prices } = usePluginWeb3StateContext() ?? {}
    return prices?.[id][currencyType as Plugin.Shared.CurrencyType] ?? 0
}
