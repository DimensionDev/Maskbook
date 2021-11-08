import { usePluginWeb3StateContext } from '../context'

export function useCurrencyType() {
    return usePluginWeb3StateContext().currencyType
}
