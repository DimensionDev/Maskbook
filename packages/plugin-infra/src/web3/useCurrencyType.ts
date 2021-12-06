import type { NetworkPluginID } from '..'
import { usePluginWeb3StateContext } from './Context'

export function useCurrencyType(pluginID?: NetworkPluginID) {
    return usePluginWeb3StateContext(pluginID).currencyType
}
