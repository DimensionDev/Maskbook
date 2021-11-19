import { Dispatch, memo, SetStateAction, useState } from 'react'
import { ChainId, Transaction, useAccount, useTransactions } from '@masknet/web3-shared-evm'
import { useUpdateEffect } from 'react-use'
import { useDashboardI18N } from '../../../../locales'
import { Box, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow } from '@mui/material'
import { makeStyles, MaskColorVar } from '@masknet/theme'
import { LoadingPlaceholder } from '../../../../components/LoadingPlaceholder'
import { EmptyPlaceholder } from '../EmptyPlaceholder'
import { HistoryTableRow } from '../HistoryTableRow'
import { noop } from 'lodash-unified'

const useStyles = makeStyles()((theme) => ({
    container: {
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
    },
    header: {
        color: MaskColorVar.normalText,
        fontWeight: theme.typography.fontWeightRegular as any,
        padding: '12px 0 12px',
        border: 'none',
        backgroundColor: MaskColorVar.primaryBackground,
    },
    footer: {
        flex: 1,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
    },
    paginationItem: {
        borderRadius: 4,
        border: `1px solid ${MaskColorVar.lineLight}`,
        color: MaskColorVar.textPrimary,
        '&.Mui-selected': {
            backgroundColor: MaskColorVar.blue,
            color: '#ffffff',
            border: 'none',
            '&:hover': {
                backgroundColor: MaskColorVar.blue,
            },
        },
    },
}))

interface HistoryTableProps {
    selectedChainId: ChainId
}

export const HistoryTable = memo<HistoryTableProps>(({ selectedChainId }) => {
    const [page, setPage] = useState(0)
    const account = useAccount()
    const {
        value = { transactions: [], hasNextPage: false },
        loading: transactionLoading,
        error: transactionError,
    } = useTransactions(account, page, 50, selectedChainId)

    const { transactions = [], hasNextPage } = value

    useUpdateEffect(() => {
        setPage(0)
    }, [account, selectedChainId])

    return (
        <HistoryTableUI
            page={page}
            onPageChange={setPage}
            hasNextPage={hasNextPage}
            isLoading={transactionLoading}
            isEmpty={!!transactionError || !transactions.length}
            dataSource={transactions}
        />
    )
})

export interface HistoryTableUIProps {
    page: number
    onPageChange: Dispatch<SetStateAction<number>>
    hasNextPage: boolean
    isLoading: boolean
    isEmpty: boolean
    dataSource: Transaction[]
}

export const HistoryTableUI = memo<HistoryTableUIProps>(
    ({ isLoading, isEmpty, dataSource, page, onPageChange, hasNextPage }) => {
        const t = useDashboardI18N()
        const { classes } = useStyles()
        return (
            <>
                <TableContainer className={classes.container}>
                    {isLoading || isEmpty ? (
                        <Box flex={1}>
                            {isLoading ? <LoadingPlaceholder /> : null}
                            {isEmpty ? <EmptyPlaceholder children={t.wallets_empty_history_tips()} /> : null}
                        </Box>
                    ) : (
                        <Table stickyHeader sx={{ padding: '0 44px' }}>
                            <TableHead>
                                <TableRow>
                                    <TableCell key="Types" align="center" variant="head" className={classes.header}>
                                        {t.wallets_history_types()}
                                    </TableCell>
                                    <TableCell key="Value" align="center" variant="head" className={classes.header}>
                                        {t.wallets_history_value()}
                                    </TableCell>
                                    <TableCell key="Receiver" align="center" variant="head" className={classes.header}>
                                        {t.wallets_history_receiver()}
                                    </TableCell>
                                </TableRow>
                            </TableHead>

                            {dataSource.length ? (
                                <TableBody>
                                    {dataSource.map((transaction, index) => (
                                        <HistoryTableRow key={index} transaction={transaction} />
                                    ))}
                                </TableBody>
                            ) : null}
                        </Table>
                    )}
                </TableContainer>

                {!(page === 0 && dataSource.length === 0) && !isLoading ? (
                    <TablePagination
                        count={-1}
                        component="div"
                        onPageChange={noop}
                        page={page}
                        rowsPerPage={30}
                        rowsPerPageOptions={[30]}
                        labelDisplayedRows={() => null}
                        backIconButtonProps={{
                            onClick: () => onPageChange((prev) => prev - 1),
                            size: 'small',
                            disabled: page === 0,
                        }}
                        nextIconButtonProps={{
                            onClick: () => onPageChange((prev) => prev + 1),
                            disabled: !hasNextPage,
                            size: 'small',
                        }}
                        sx={{ overflow: 'hidden' }}
                    />
                ) : null}
            </>
        )
    },
)
