import type { NetworkPluginID, TransactionStatusType } from '..'
import { usePluginWeb3StateContext } from './Context'

export function useTransactions(pluginID?: NetworkPluginID, status?: TransactionStatusType) {
    const { transactions } = usePluginWeb3StateContext(pluginID)
    return typeof status === 'undefined' ? transactions : transactions.filter((x) => status === x.status)
}
