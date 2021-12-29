import type { NetworkPluginID } from '..'
import { usePluginWeb3StateContext } from './Context'

export function useCurrencyType<T extends string>(pluginID?: NetworkPluginID) {
    return usePluginWeb3StateContext(pluginID).currencyType as T
}
