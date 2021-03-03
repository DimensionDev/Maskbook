import { Table, TableBody, Typography } from '@material-ui/core'
import { useTransactions } from '../../../../plugins/Wallet/hooks/useTransactions'
import { TransactionProvider } from '../../../../plugins/Wallet/types'
import { useAccount } from '../../../../web3/hooks/useAccount'
import { Row } from './Row'

export function TransactionList() {
    const account = useAccount()
    const { value: transactions = [], loading: transactionsLoading, error: transactionsError } = useTransactions(
        account,
        TransactionProvider.DEBANK,
    )
    if (transactionsLoading) return <Typography>Loading...</Typography>
    if (transactionsError) return <Typography>Failed to load transactions.</Typography>
    return (
        <Table>
            <TableBody>
                {transactions.map((transaction) => (
                    <Row key={transaction.id} transaction={transaction} />
                ))}
            </TableBody>
        </Table>
    )
}
