import { Dispatch, memo, SetStateAction, useState } from 'react'
import { useUpdateEffect } from 'react-use'
import { useDashboardI18N } from '../../../../locales'
import { Box, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow } from '@mui/material'
import { makeStyles, MaskColorVar } from '@masknet/theme'
import { LoadingPlaceholder } from '../../../../components/LoadingPlaceholder'
import { EmptyPlaceholder } from '../EmptyPlaceholder'
import { HistoryTableRow } from '../HistoryTableRow'
import { noop } from 'lodash-unified'
import { useAccount, useTransactions, Web3Helper } from '@masknet/plugin-infra/web3'
import { NetworkPluginID, Transaction } from '@masknet/web3-shared-base'
import { EMPTY_LIST } from '@masknet/shared-base'
import type { ChainId, SchemaType } from '@masknet/web3-shared-evm'

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
    selectedChainId: Web3Helper.ChainIdAll
}

export const HistoryTable = memo<HistoryTableProps>(({ selectedChainId }) => {
    const [page, setPage] = useState(0)
    const account = useAccount(NetworkPluginID.PLUGIN_EVM)
    const { value, loading } = useTransactions()

    useUpdateEffect(() => {
        setPage(0)
    }, [account, selectedChainId])

    return (
        <HistoryTableUI
            page={page}
            onPageChange={setPage}
            hasNextPage={false}
            isLoading={loading}
            isEmpty={!value?.data?.length}
            dataSource={(value?.data ?? EMPTY_LIST) as Array<Transaction<ChainId, SchemaType>>}
            selectedChainId={selectedChainId}
        />
    )
})

export interface HistoryTableUIProps {
    page: number
    onPageChange: Dispatch<SetStateAction<number>>
    hasNextPage: boolean
    isLoading: boolean
    isEmpty: boolean
    dataSource: Array<Transaction<ChainId, SchemaType>>
    selectedChainId: Web3Helper.ChainIdAll
}

export const HistoryTableUI = memo<HistoryTableUIProps>(
    ({ isLoading, isEmpty, dataSource, page, onPageChange, hasNextPage, selectedChainId }) => {
        const t = useDashboardI18N()
        const { classes } = useStyles()
        return (
            <>
                <TableContainer className={classes.container}>
                    {isLoading || isEmpty ? (
                        <Box flex={1}>
                            {isLoading ? <LoadingPlaceholder /> : null}
                            {isEmpty && !isLoading ? (
                                <EmptyPlaceholder children={t.wallets_empty_history_tips()} />
                            ) : null}
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
                                        <HistoryTableRow
                                            key={index}
                                            transaction={transaction}
                                            selectedChainId={selectedChainId}
                                        />
                                    ))}
                                </TableBody>
                            ) : null}
                        </Table>
                    )}
                </TableContainer>

                {!(page === 0 && !hasNextPage) && !isLoading ? (
                    <Box className={classes.footer}>
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
                    </Box>
                ) : null}
            </>
        )
    },
)
