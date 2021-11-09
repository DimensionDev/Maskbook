import { usePluginWeb3StateContext } from '../context'

export function useTransactionType(pluginID?: string) {
    return usePluginWeb3StateContext(pluginID).transactionType
}
