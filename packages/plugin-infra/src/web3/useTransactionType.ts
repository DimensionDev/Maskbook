import type { NetworkPluginID } from '..'
import { usePluginWeb3StateContext } from './Context'

export function useTransactionType<T extends string>(pluginID?: NetworkPluginID) {
    return usePluginWeb3StateContext(pluginID).transactionType as T
}
