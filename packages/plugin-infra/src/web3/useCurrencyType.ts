import { usePluginWeb3StateContext } from './Context'

export function useCurrencyType(pluginID?: string) {
    return usePluginWeb3StateContext(pluginID).currencyType
}
