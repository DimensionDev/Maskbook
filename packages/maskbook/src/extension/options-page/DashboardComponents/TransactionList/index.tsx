import { Table, TableBody, Typography } from '@material-ui/core'
import { useTransactions } from '../../../../plugins/Wallet/hooks/useTransactions'
import { TransactionProvider } from '../../../../plugins/Wallet/types'
import { useAccount } from '../../../../web3/hooks/useAccount'
import { Row } from './Row'

export function TransactionList() {
    const account = useAccount()
    const { value: transactions = [], loading: transactionsLoading, error: transactionsError } = useTransactions(
        process.env.NODE_ENV === 'development' ? '0x9972d940c9a23f84fcf92867d18f28d75d010e5e' : account,
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
