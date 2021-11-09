import { usePluginWeb3StateContext } from '../context'

export function useCurrencyType(pluginID?: string) {
    return usePluginWeb3StateContext(pluginID).currencyType
}
