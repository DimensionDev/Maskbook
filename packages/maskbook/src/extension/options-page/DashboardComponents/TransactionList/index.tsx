import {
    Box,
    Button,
    CircularProgress,
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
import { useAccount } from '../../../../web3/hooks/useAccount'
import { Row } from './Row'
import AutoResize from 'react-virtualized-auto-sizer'
import { FixedSizeList } from 'react-window'
import { useMemo, useState } from 'react'
import { FilterTransactionType } from '../../../../plugins/Wallet/types'

const useStyles = makeStyles(() =>
    createStyles({
        fixed: { tableLayout: 'fixed' },
        loading: {
            position: 'absolute',
            bottom: 0,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            width: '100%',
        },
    }),
)

export interface TransactionListProps {
    transactionType: FilterTransactionType
}

export function TransactionList({ transactionType }: TransactionListProps) {
    const styles = useStyles()
    const account = useAccount()

    const [page, setPage] = useState(1)

    const {
        value: transactions = [],
        loading: transactionsLoading,
        error: transactionsError,
        retry: transactionsRetry,
    } = useTransactions(account, page)

    const dataSource = useMemo(() => {
        return transactions.filter(({ transactionType: type }) =>
            transactionType === FilterTransactionType.ALL ? true : type === transactionType,
        )
    }, [transactions, transactionType])

    if (transactionsLoading && page === 1)
        return (
            <Table>
                <TableBody>
                    {new Array(3).fill(0).map((_, i) => (
                        <TableRow key={i}>
                            <TableCell>
                                <Skeleton animation="wave" variant="rectangular" width="100%" height={30} />
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        )

    if (transactionsError || dataSource.length === 0)
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
        <>
            <AutoResize>
                {({ width, height }) => {
                    return (
                        <FixedSizeList
                            onItemsRendered={({ visibleStopIndex, overscanStopIndex }) => {
                                if (dataSource.length === 0 || transactionsError || transactionsLoading) return

                                if (
                                    visibleStopIndex === overscanStopIndex &&
                                    visibleStopIndex === dataSource.length - 1
                                )
                                    setPage((prev) => prev + 1)
                            }}
                            itemSize={96}
                            itemCount={dataSource.length}
                            overscanCount={5}
                            width={width}
                            height={height - 40}>
                            {({ index, style }) => {
                                const transaction = dataSource[index]
                                return transaction ? (
                                    <Row key={transaction.id} transaction={transaction} style={style} />
                                ) : null
                            }}
                        </FixedSizeList>
                    )
                }}
            </AutoResize>
            {transactionsLoading && (
                <Box className={styles.loading}>
                    <CircularProgress size={25} />
                </Box>
            )}
        </>
    )
}
