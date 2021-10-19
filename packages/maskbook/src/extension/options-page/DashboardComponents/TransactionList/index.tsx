import { useMemo, useState } from 'react'
import { useUpdateEffect } from 'react-use'
import {
    Box,
    Button,
    Skeleton,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TablePagination,
    TableRow,
    Typography,
} from '@material-ui/core'
import { makeStyles } from '@masknet/theme'
import { useAccount, useChainId, useTransactions, FilterTransactionType } from '@masknet/web3-shared-evm'
import { Row } from './Row'

const useStyles = makeStyles()({
    fixed: { height: 'calc(100% - 52px)' },
})

export interface TransactionListProps {
    transactionType: FilterTransactionType
}

export function TransactionList({ transactionType }: TransactionListProps) {
    const { classes: styles } = useStyles()
    const chainId = useChainId()
    const account = useAccount()
    const [page, setPage] = useState(0)

    const {
        value = { transactions: [], hasNextPage: false },
        loading: transactionsLoading,
        error: transactionsError,
        retry: transactionsRetry,
    } = useTransactions(account, page)

    const { transactions = [], hasNextPage } = value

    const dataSource = useMemo(() => {
        return transactions.filter(({ transactionType: type }) =>
            transactionType === FilterTransactionType.ALL ? true : type === transactionType,
        )
    }, [transactions, transactions.length, transactionType])

    useUpdateEffect(() => {
        setPage(0)
    }, [transactionType, account, chainId])

    if (transactionsLoading)
        return (
            <Table>
                <TableBody>
                    {Array.from({ length: 3 })
                        .fill(0)
                        .map((_, i) => (
                            <TableRow key={i}>
                                <TableCell>
                                    <Skeleton animation="wave" variant="rectangular" width="100%" height={30} />
                                </TableCell>
                            </TableRow>
                        ))}
                </TableBody>
            </Table>
        )

    return (
        <>
            <TableContainer className={styles.fixed}>
                {transactionsError || dataSource.length === 0 ? (
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
                ) : (
                    <Table>
                        <TableBody>
                            {dataSource.map((transaction) => (
                                <Row key={transaction.id} chainId={chainId} transaction={transaction} />
                            ))}
                        </TableBody>
                    </Table>
                )}
            </TableContainer>

            {!(page === 0 && dataSource.length === 0) ? (
                <TablePagination
                    count={-1}
                    component="div"
                    onPageChange={() => {}}
                    page={page}
                    rowsPerPage={30}
                    rowsPerPageOptions={[30]}
                    labelDisplayedRows={() => null}
                    backIconButtonProps={{
                        onClick: () => setPage((prev) => prev - 1),
                        size: 'small',
                        disabled: page === 0,
                    }}
                    nextIconButtonProps={{
                        onClick: () => setPage((prev) => prev + 1),
                        disabled: !hasNextPage,
                        size: 'small',
                    }}
                />
            ) : null}
        </>
    )
}
