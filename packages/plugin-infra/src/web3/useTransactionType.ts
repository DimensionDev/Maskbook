import type { NetworkPluginID } from '..'
import { usePluginWeb3StateContext } from './Context'

export function useTransactionType(pluginID?: NetworkPluginID) {
    return usePluginWeb3StateContext(pluginID).transactionType
}
