import { useWeb3StateContext } from '.'

export function useTransactionType() {
    return useWeb3StateContext().transactionType
}
