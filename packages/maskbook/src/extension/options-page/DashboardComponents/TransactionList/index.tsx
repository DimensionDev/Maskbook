import {
    Box,
    Button,
    createStyles,
    IconButton,
    makeStyles,
    Skeleton,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TablePagination,
    TableRow,
    Typography,
} from '@material-ui/core'
import { useTransactions } from '../../../../plugins/Wallet/hooks/useTransactions'
import { useAccount } from '../../../../web3/hooks/useAccount'
import { Row } from './Row'
import { useMemo, useState } from 'react'
import { FilterTransactionType } from '../../../../plugins/Wallet/types'
import { useChainId } from '../../../../web3/hooks/useChainState'
import { KeyboardArrowLeft, KeyboardArrowRight } from '@material-ui/icons'

const useStyles = makeStyles(() =>
    createStyles({
        fixed: { height: 'calc(100% - 52px)' },
    }),
)

export interface TransactionListProps {
    transactionType: FilterTransactionType
}

export function TransactionList({ transactionType }: TransactionListProps) {
    const styles = useStyles()
    const chainId = useChainId()
    const account = useAccount()
    const [page, setPage] = useState(1)

    const {
        value = { transactions: [], hasNextPage: false },
        loading: transactionsLoading,
        error: transactionsError,
        retry: transactionsRetry,
    } = useTransactions(account, page)

    const { transactions, hasNextPage } = value

    const dataSource = useMemo(() => {
        return transactions.filter(({ transactionType: type }) =>
            transactionType === FilterTransactionType.ALL ? true : type === transactionType,
        )
    }, [transactions, transactions.length, transactionType])

    if (transactionsLoading)
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

            <TablePagination
                count={-1}
                component="div"
                onPageChange={() => {}}
                page={page}
                rowsPerPage={30}
                rowsPerPageOptions={[30]}
                labelDisplayedRows={() => null}
                ActionsComponent={() => {
                    return (
                        <Box display="flex">
                            <IconButton size="small" disabled={page === 1} onClick={() => setPage((prev) => prev - 1)}>
                                <KeyboardArrowLeft />
                            </IconButton>
                            <IconButton
                                size="small"
                                disabled={!hasNextPage}
                                onClick={() => setPage((prev) => prev + 1)}>
                                <KeyboardArrowRight />
                            </IconButton>
                        </Box>
                    )
                }}
            />
        </>
    )
}
