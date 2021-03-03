import { Typography } from "@material-ui/core"
import { useTransactions } from "../../../plugins/Wallet/hooks/useTransactions"
import { TransactionProvider } from "../../../plugins/Wallet/types"
import { useAccount } from "../../../web3/hooks/useAccount"

export function TransactionList() {
    const account = useAccount()
    const {
        value: transactions = [],
        loading: transactionsLoading,
        error: transactionsError
    } = useTransactions(account, TransactionProvider.DEBANK)

    if (transactionsLoading) return <Typography>Loading...</Typography>
    if (transactionsError) return <Typography>Failed to load transactions.</Typography>

    return <div>
        {
            transactions.map((transaction) => <div key={transaction.id}>
                <Typography>{transaction.id}</Typography>
            </div>)
        }
    </div>
}
