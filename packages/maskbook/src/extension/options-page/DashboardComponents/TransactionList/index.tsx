import {
    Box,
    Button,
    createStyles,
    makeStyles,
    Skeleton,
    Table,
    TableBody,
    TableCell,
    TableRow,
    Typography,
} from '@material-ui/core'
import { useTransactions } from '../../../../plugins/Wallet/hooks/useTransactions'
import { PortfolioProvider } from '../../../../plugins/Wallet/types'
import { useAccount } from '../../../../web3/hooks/useAccount'
import { Row } from './Row'
import AutoResize from 'react-virtualized-auto-sizer'
import { FixedSizeList } from 'react-window'

export function TransactionList() {
    const account = useAccount()
    const {
        value: transactions = [],
        loading: transactionsLoading,
        error: transactionsError,
        retry: transactionsRetry,
    } = useTransactions(account)

    if (transactionsLoading)
        return (
            <Table>
                <TableBody>
                    {new Array(3).fill(0).map((_, i) => (
                        <TableRow key={i}>
                            <TableCell>
                                <Skeleton animation="wave" variant="rectangular" width="100%" height={30}></Skeleton>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        )

    if (transactionsError || transactions.length === 0)
        return (
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100%',
                }}>
                <Typography color="textSecondary">No transaction found.</Typography>
                <Button
                    sx={{
                        marginTop: 1,
                    }}
                    variant="text"
                    onClick={() => transactionsRetry()}>
                    Retry
                </Button>
            </Box>
        )

    return (
        <AutoResize>
            {(sizeProps) => {
                return (
                    <FixedSizeList itemSize={96} itemCount={transactions.length} overscanCount={5} {...sizeProps}>
                        {({ index, style }) => {
                            const transaction = transactions[index]
                            return transaction ? (
                                <Row key={transaction.id} transaction={transaction} style={style} />
                            ) : null
                        }}
                    </FixedSizeList>
                )
            }}
        </AutoResize>
    )
}
