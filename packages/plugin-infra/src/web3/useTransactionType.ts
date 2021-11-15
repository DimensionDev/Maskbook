import { usePluginWeb3StateContext } from './Context'

export function useTransactionType(pluginID?: string) {
    return usePluginWeb3StateContext(pluginID).transactionType
}
