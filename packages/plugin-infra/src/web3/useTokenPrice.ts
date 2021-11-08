import { useWeb3StateContext } from '.'
import type { Plugin } from '..'

export function useTokenPrice(id: string, currencyType: string) {
    const { prices } = useWeb3StateContext() ?? {}
    return prices?.[id][currencyType as Plugin.Shared.CurrencyType] ?? 0
}
