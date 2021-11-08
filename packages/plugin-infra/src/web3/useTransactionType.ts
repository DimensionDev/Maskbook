import { usePluginWeb3StateContext } from '../context'

export function useTransactionType() {
    return usePluginWeb3StateContext().transactionType
}
